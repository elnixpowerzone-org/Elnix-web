import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  res.cookies.set('elnix_admin_token', '', {
    path: '/',
    httpOnly: true,
    expires: new Date(0),
    maxAge: 0,
  });
  return res;
}

