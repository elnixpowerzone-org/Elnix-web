import { NextRequest, NextResponse } from 'next/server';
import { getProducts, saveProduct } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const search = searchParams.get('search') || undefined;
  const featured = searchParams.get('featured') === 'true';

  const products = await getProducts({ category, brand, search, featured });
  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await saveProduct(body);
    return NextResponse.json({ success: true, data: product });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error saving product';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

