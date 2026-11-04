import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const result = await verifyAdminRequest(req);
  if (!result.authorized) {
    return NextResponse.json(
      { success: false, authenticated: false, error: result.error },
      { status: result.status || 401 }
    );
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: result.user,
  });
}

