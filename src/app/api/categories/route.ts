import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCategories, saveCategory, deleteCategory } from '@/lib/store';

export async function GET() {
  const categories = await getCategories();
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const category = await saveCategory(body);
    revalidatePath('/');
    revalidatePath('/products');
    return NextResponse.json({ success: true, data: category });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving category';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  const slug = searchParams.get('slug') || '';
  const name = searchParams.get('name') || '';

  if (!id && !slug) {
    return NextResponse.json({ success: false, error: 'Category ID or Slug required' }, { status: 400 });
  }

  const success = await deleteCategory(id || slug, { slug, name });
  revalidatePath('/');
  revalidatePath('/products');
  return NextResponse.json({ success });
}
