import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBrands, saveBrand, deleteBrand } from '@/lib/store';
import { requireAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const brands = await getBrands();
  return NextResponse.json({ success: true, data: brands });
}

export async function POST(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    if (!body || typeof body !== 'object' || !body.name) {
      return NextResponse.json({ success: false, error: 'Brand name is required' }, { status: 400 });
    }
    const brand = await saveBrand(body);
    revalidatePath('/');
    revalidatePath('/products');
    return NextResponse.json({ success: true, data: brand });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving brand';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin(req);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  const slug = searchParams.get('slug') || '';
  const name = searchParams.get('name') || '';

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'Brand ID or Slug required' }, { status: 400 });
  }

  const success = await deleteBrand(id || slug, { slug, name });
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success });
}
