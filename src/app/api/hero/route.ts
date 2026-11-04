import { NextRequest, NextResponse } from 'next/server';
import { getHeroSettings, updateHeroSettings } from '@/lib/store';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hero = await getHeroSettings();
    return NextResponse.json(
      { success: true, data: hero },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch hero settings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid hero settings payload' }, { status: 400 });
    }
    const hero = await updateHeroSettings(body);
    return NextResponse.json({ success: true, data: hero });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update hero settings';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
