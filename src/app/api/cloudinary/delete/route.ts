import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { public_id } = body;

    if (!public_id) {
      return NextResponse.json(
        { success: false, error: 'public_id is required' },
        { status: 400 }
      );
    }

    if (isCloudinaryConfigured()) {
      const result = await cloudinary.uploader.destroy(public_id);
      return NextResponse.json({
        success: true,
        result,
        message: 'Image deleted from Cloudinary successfully',
      });
    }

    // Demo mode response
    return NextResponse.json({
      success: true,
      message: 'Image deleted (Demo mode)',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

