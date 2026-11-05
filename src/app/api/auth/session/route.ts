import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest, signAdminToken, TOKEN_MAX_AGE_SECONDS } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const result = await verifyAdminRequest(req);
  if (!result.authorized || !result.user) {
    return NextResponse.json(
      { success: false, authenticated: false, error: result.error },
      { status: result.status || 401 }
    );
  }

  const res = NextResponse.json({
    success: true,
    authenticated: true,
    user: result.user,
  });

  // If verified via Bearer header or un-prefixed token, set the standard signed cookie
  const existingCookie = req.cookies.get('elnix_admin_token')?.value;
  if (!existingCookie || !existingCookie.startsWith('elnix_v1.')) {
    const token = signAdminToken(result.user);
    res.cookies.set('elnix_admin_token', token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: TOKEN_MAX_AGE_SECONDS,
      secure: process.env.NODE_ENV === 'production',
    });
  }

  return res;
}

