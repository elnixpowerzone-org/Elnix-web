import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlug, saveProduct, deleteProduct } from '@/lib/store';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductBySlug(id);
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: product });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
    }
    const updated = await saveProduct({ ...body, id });
    return NextResponse.json({ success: true, data: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error updating product';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ success: false, error: 'Product ID required' }, { status: 400 });
  }
  const success = await deleteProduct(id);
  return NextResponse.json({ success });
}
