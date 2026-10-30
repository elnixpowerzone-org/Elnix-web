import { NextRequest, NextResponse } from 'next/server';
import { getSiteSettings, updateSiteSettings } from '@/lib/store';

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const settings = await updateSiteSettings(body);
    return NextResponse.json({ success: true, data: settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating settings';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

