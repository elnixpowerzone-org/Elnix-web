import { NextRequest, NextResponse } from 'next/server';
import { getEnquiries, createEnquiry, updateEnquiryStatus } from '@/lib/store';

export async function GET() {
  const enquiries = await getEnquiries();
  return NextResponse.json({ success: true, data: enquiries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }
    const enquiry = await createEnquiry(body);
    return NextResponse.json({ success: true, data: enquiry });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error submitting enquiry';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, notes } = body;
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'ID and status required' }, { status: 400 });
    }
    const success = await updateEnquiryStatus(id, status, notes);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating enquiry';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

