import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'elnix_powerzone';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    // If Cloudinary credentials are fully configured, upload directly to Cloudinary
    if (isCloudinaryConfigured()) {
      const uploadResult = await cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'auto',
      });

      return NextResponse.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes,
      });
    }

    // Demo/Fallback mode when keys are placeholder: Return base64 with simulated Cloudinary public_id
    // This allows instant testing in development without crashing!
    const mockPublicId = `${folder}/demo_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      success: true,
      url: base64Data,
      public_id: mockPublicId,
      isDemo: true,
      message: 'Uploaded in local preview mode. Add real Cloudinary keys in .env.local for production CDN storage.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

