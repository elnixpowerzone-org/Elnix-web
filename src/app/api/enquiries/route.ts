import { NextRequest, NextResponse } from 'next/server';
import { getEnquiries, createEnquiry, updateEnquiryStatus } from '@/lib/store';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Critical 2: Reject unauthenticated callers (401) or non-admin callers (403)
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const enquiries = await getEnquiries();
  return NextResponse.json({ success: true, data: enquiries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid enquiry payload' },
        { status: 400 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    const enquiry = await createEnquiry(body);

    // Return only confirmation and created ID; do NOT expose or return existing enquiries
    return NextResponse.json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: {
        id: enquiry.id,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error submitting enquiry';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  // Critical 2: Protecting enquiry status update and notes
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Enquiry ID and status are required' },
        { status: 400 }
      );
    }

    const success = await updateEnquiryStatus(id, status, notes);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating enquiry';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
