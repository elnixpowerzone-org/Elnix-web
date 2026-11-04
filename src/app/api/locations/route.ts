import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { 
  getStoreLocations, 
  saveStoreLocation, 
  deleteStoreLocation, 
  reorderStoreLocations 
} from '@/lib/store';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const onlyVisible = searchParams.get('public') === 'true' || searchParams.get('onlyVisible') === 'true';
    const locations = await getStoreLocations({ onlyVisible });
    return NextResponse.json(
      { success: true, data: locations },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch locations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: 'Location name and address are required' },
        { status: 400 }
      );
    }

    const saved = await saveStoreLocation({
      ...body,
      name,
      address,
    });

    revalidatePath('/contact');
    revalidatePath('/locations');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: saved });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving location';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    if (body.action === 'reorder') {
      if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'orderedIds must be a non-empty array of location IDs' },
          { status: 400 }
        );
      }
      await reorderStoreLocations(body.orderedIds);
      revalidatePath('/contact');
      revalidatePath('/locations');
      return NextResponse.json({ success: true });
    }

    const id = typeof body.id === 'string' ? body.id.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Location ID is required for update' },
        { status: 400 }
      );
    }

    if (!name || !address) {
      return NextResponse.json(
        { success: false, error: 'Location name and address are required' },
        { status: 400 }
      );
    }

    const updated = await saveStoreLocation({
      ...body,
      id,
      name,
      address,
    });

    revalidatePath('/contact');
    revalidatePath('/locations');
    revalidatePath('/');
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating location';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')?.trim();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Location ID required for deletion' },
        { status: 400 }
      );
    }

    const success = await deleteStoreLocation(id);
    revalidatePath('/contact');
    revalidatePath('/locations');
    revalidatePath('/');
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error deleting location';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
