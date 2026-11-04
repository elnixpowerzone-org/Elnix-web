import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/client';
import { signAdminToken, AdminAuthUser, TOKEN_MAX_AGE_SECONDS } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // 1. Attempt Supabase Auth if configured
    const supabase = createAdminClient() || createClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: cleanPassword,
        });

        if (!error && data?.user && data?.session?.access_token) {
          // Strictly check verified database role or trusted app_metadata
          const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name')
            .eq('id', data.user.id)
            .maybeSingle();

          const isVerifiedAdmin =
            profile?.role === 'admin' ||
            data.user.app_metadata?.role === 'admin';

          if (!isVerifiedAdmin) {
            return NextResponse.json(
              { success: false, error: 'Access Denied: Account lacks administrator privileges' },
              { status: 403 }
            );
          }

          const adminUser: AdminAuthUser = {
            id: data.user.id,
            email: data.user.email || normalizedEmail,
            role: 'admin',
            full_name: profile?.full_name || 'Elnix Administrator',
          };

          // Do NOT return the raw bearer token in the JSON body (eliminates localStorage storage)
          const res = NextResponse.json({
            success: true,
            user: adminUser,
          });

          // Set HttpOnly cookie with 30-minute expiration matching token lifetime
          res.cookies.set('elnix_admin_token', data.session.access_token, {
            path: '/',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: TOKEN_MAX_AGE_SECONDS, // 30 minutes
            secure: process.env.NODE_ENV === 'production',
          });

          return res;
        }
      } catch (authErr) {
        console.warn('Supabase authentication warning:', authErr);
      }
    }

    // 2. Emergency Admin Mechanism (Configured strictly via server-only environment variables)
    const emergencyEmail = process.env.ADMIN_EMERGENCY_EMAIL?.trim().toLowerCase();
    const emergencyPassword = process.env.ADMIN_EMERGENCY_PASSWORD?.trim();

    if (
      emergencyEmail &&
      emergencyPassword &&
      emergencyPassword.length >= 8 &&
      normalizedEmail === emergencyEmail
    ) {
      const inputBuffer = Buffer.from(cleanPassword);
      const targetBuffer = Buffer.from(emergencyPassword);

      const isValidPassword =
        inputBuffer.length === targetBuffer.length &&
        crypto.timingSafeEqual(inputBuffer, targetBuffer);

      if (isValidPassword) {
        const adminUser: AdminAuthUser = {
          id: 'admin-emergency',
          email: emergencyEmail,
          role: 'admin',
          full_name: 'Elnix Administrator',
        };

        const token = signAdminToken(adminUser);

        // Do NOT return token in response body
        const res = NextResponse.json({
          success: true,
          user: adminUser,
        });

        res.cookies.set('elnix_admin_token', token, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          maxAge: TOKEN_MAX_AGE_SECONDS, // 30 minutes
          secure: process.env.NODE_ENV === 'production',
        });

        return res;
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid admin credentials' },
      { status: 401 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
