import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';

export interface AdminAuthUser {
  id: string;
  email: string;
  role: 'admin';
  full_name?: string;
}

export interface AdminAuthResult {
  authorized: boolean;
  status?: number;
  error?: string;
  user?: AdminAuthUser;
}

const TOKEN_PREFIX = 'elnix_v1';
export const TOKEN_MAX_AGE_SECONDS = 30 * 60; // 30 minutes
const MIN_SECRET_LENGTH = 32; // Minimum 256 bits

/**
 * Retrieves the server-only admin signing secret.
 * Enforces strict presence and strength requirements; fails closed without fallback.
 */
export function getAuthSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length < MIN_SECRET_LENGTH) {
    throw new Error(
      'Server configuration error: ADMIN_JWT_SECRET is missing or insufficiently strong (minimum 32 characters required).'
    );
  }
  return secret.trim();
}

/**
 * Creates a cryptographically signed admin session token.
 * Token expires in 30 minutes.
 */
export function signAdminToken(user: AdminAuthUser): string {
  const secret = getAuthSecret();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: user.id,
    email: user.email,
    role: 'admin',
    full_name: user.full_name || 'Elnix Administrator',
    iat: now,
    exp: now + TOKEN_MAX_AGE_SECONDS,
  };

  const payloadEncoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${TOKEN_PREFIX}.${payloadEncoded}`)
    .digest('base64url');

  return `${TOKEN_PREFIX}.${payloadEncoded}.${signature}`;
}

export interface VerifySignedTokenResult {
  valid: boolean;
  expired?: boolean;
  error?: string;
  payload?: {
    id: string;
    email: string;
    role: string;
    full_name?: string;
    exp: number;
  };
}

/**
 * Verifies a cryptographically signed session token.
 * Validates HMAC signature with timingSafeEqual and checks 30-minute expiration.
 */
export function verifySignedAdminToken(token: string): VerifySignedTokenResult {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Malformed token' };
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== TOKEN_PREFIX) {
    return { valid: false, error: 'Invalid token structure' };
  }

  const [prefix, payloadEncoded, signature] = parts;

  let secret: string;
  try {
    secret = getAuthSecret();
  } catch (err) {
    console.error('Token verification failed closed: secret unavailable', err);
    return { valid: false, error: 'Authentication service configuration error' };
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${prefix}.${payloadEncoded}`)
    .digest('base64url');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSignature);

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false, error: 'Invalid token signature' };
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);

    if (!payload.exp || payload.exp < now) {
      return { valid: false, expired: true, error: 'Session expired' };
    }

    return {
      valid: true,
      payload: {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        full_name: payload.full_name,
        exp: payload.exp,
      },
    };
  } catch {
    return { valid: false, error: 'Failed to decode token payload' };
  }
}

/**
 * Enforces CSRF protection for cookie-authenticated state-changing requests.
 */
export function validateCsrfProtection(req: NextRequest): NextResponse | null {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null;
  }

  const hasCookieAuth = !!(
    req.cookies.get('elnix_admin_token')?.value ||
    req.cookies.get('sb-access-token')?.value
  );

  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  const hasBearerHeader = !!(authHeader && authHeader.toLowerCase().startsWith('bearer '));

  // If request relies on cookie authentication without an explicit Bearer header, enforce CSRF
  if (hasCookieAuth && !hasBearerHeader) {
    const secFetchSite = req.headers.get('sec-fetch-site');
    if (secFetchSite && secFetchSite === 'cross-site') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cross-site request rejected (CSRF protection)' },
        { status: 403 }
      );
    }

    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host !== host) {
          return NextResponse.json(
            { success: false, error: 'Forbidden: Cross-origin request rejected (CSRF protection)' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Malformed origin header' },
          { status: 403 }
        );
      }
    }
  }

  return null;
}

/**
 * Inspects a request for administrative authorization.
 * Checks both Authorization Bearer tokens and HTTP cookies.
 * Reuses Supabase authentication and verifies role in profiles table.
 */
export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  let token: string | null = null;

  // 1. Check Authorization header
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.substring(7).trim();
  }

  // 2. Check cookies if header is absent
  if (!token) {
    const cookieToken =
      req.cookies.get('elnix_admin_token')?.value ||
      req.cookies.get('sb-access-token')?.value;
    if (cookieToken) {
      token = cookieToken.trim();
    }
  }

  // 3. If no token found -> 401 Unauthorized
  if (!token) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication required. Please log in as an administrator.',
    };
  }

  // 4. Check if token is our signed admin token
  if (token.startsWith(`${TOKEN_PREFIX}.`)) {
    const verified = verifySignedAdminToken(token);
    if (!verified.valid) {
      return {
        authorized: false,
        status: 401,
        error: verified.error || 'Unauthorized: Invalid or expired admin session.',
      };
    }

    if (verified.payload?.role !== 'admin') {
      return {
        authorized: false,
        status: 403,
        error: 'Forbidden: Administrator privileges required.',
      };
    }

    return {
      authorized: true,
      user: {
        id: verified.payload.id,
        email: verified.payload.email,
        role: 'admin',
        full_name: verified.payload.full_name || 'Elnix Administrator',
      },
    };
  }

  // 5. Otherwise verify as Supabase JWT
  const supabase = createAdminClient() || createClient();
  if (!supabase) {
    return {
      authorized: false,
      status: 401,
      error: 'Unauthorized: Authentication provider not configured.',
    };
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return {
        authorized: false,
        status: 401,
        error: 'Unauthorized: Invalid or expired authentication token.',
      };
    }

    // Role check: ONLY trusted database role or trusted app_metadata
    // Never trust user-editable user_metadata or hardcoded email addresses
    let profileData: { role?: string; full_name?: string } | null = null;

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .maybeSingle();

    if (profile) {
      profileData = profile;
    } else {
      // If server admin client lacks service_role bypass privileges on profiles table under RLS,
      // query profiles using an authenticated client bearing the user's verified token
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey =
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseKey) {
        try {
          const authClient = createSupabaseClient(supabaseUrl, supabaseKey, {
            global: {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          });
          const { data: userProfile } = await authClient
            .from('profiles')
            .select('role, full_name')
            .eq('id', user.id)
            .maybeSingle();
          if (userProfile) {
            profileData = userProfile;
          }
        } catch {
          // ignore error
        }
      }
    }

    const isVerifiedAdmin =
      profileData?.role === 'admin' ||
      user.app_metadata?.role === 'admin';

    if (isVerifiedAdmin) {
      return {
        authorized: true,
        user: {
          id: user.id,
          email: user.email || '',
          role: 'admin',
          full_name: profileData?.full_name || 'Elnix Administrator',
        },
      };
    }

    // Authenticated non-admin user -> 403 Forbidden
    return {
      authorized: false,
      status: 403,
      error: 'Forbidden: Administrator privileges required.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Authentication verification failed';
    return {
      authorized: false,
      status: 401,
      error: `Unauthorized: ${msg}`,
    };
  }
}

/**
 * Route protection helper. Returns a NextResponse error if unauthorized or CSRF checks fail,
 * or null if the caller is an authorized administrator.
 */
export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const csrfError = validateCsrfProtection(req);
  if (csrfError) return csrfError;

  const result = await verifyAdminRequest(req);
  if (!result.authorized) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || 'Unauthorized',
      },
      { status: result.status || 401 }
    );
  }
  return null;
}
