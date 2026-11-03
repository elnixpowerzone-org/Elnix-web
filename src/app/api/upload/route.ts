import { NextRequest, NextResponse } from 'next/server';
import cloudinary, { isCloudinaryConfigured } from '@/lib/cloudinary';
import { Readable } from 'stream';
import fs from 'fs/promises';
import path from 'path';

export const maxDuration = 60;

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
    const mimeType = file.type || '';
    const isVideo = mimeType.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

    // 1. Attempt Cloudinary Upload if configured
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await new Promise<{
          secure_url: string;
          public_id: string;
          format?: string;
          width?: number;
          height?: number;
          bytes?: number;
          resource_type?: string;
        }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder,
              resource_type: isVideo ? 'video' : 'auto',
            },
            (error, result) => {
              if (error || !result) reject(error || new Error('Cloudinary stream produced no result'));
              else resolve(result);
            }
          );

          // Correct Node.js stream creation
          Readable.from(buffer).pipe(uploadStream);
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          format: uploadResult.format,
          width: uploadResult.width,
          height: uploadResult.height,
          bytes: uploadResult.bytes,
          resource_type: uploadResult.resource_type || (isVideo ? 'video' : 'image'),
          isCloudinary: true,
        });
      } catch (cloudErr: unknown) {
        const cloudMessage = cloudErr instanceof Error ? cloudErr.message : JSON.stringify(cloudErr);
        console.warn('Cloudinary stream upload failed, trying base64 upload:', cloudMessage);

        try {
          // Attempt base64 direct upload as second Cloudinary strategy
          const base64Data = `data:${mimeType || (isVideo ? 'video/mp4' : 'image/jpeg')};base64,${buffer.toString('base64')}`;
          const b64Result = await cloudinary.uploader.upload(base64Data, {
            folder,
            resource_type: isVideo ? 'video' : 'auto',
          });

          return NextResponse.json({
            success: true,
            url: b64Result.secure_url,
            public_id: b64Result.public_id,
            format: b64Result.format,
            bytes: b64Result.bytes,
            resource_type: b64Result.resource_type || (isVideo ? 'video' : 'image'),
            isCloudinary: true,
          });
        } catch (b64Err: unknown) {
          const b64Message = b64Err instanceof Error ? b64Err.message : JSON.stringify(b64Err);
          console.error('Cloudinary base64 upload also failed:', b64Message);

          // Save locally as resilient fallback
          const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
          await fs.mkdir(uploadsDir, { recursive: true });

          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const filename = `${Date.now()}_${safeName}`;
          const filePath = path.join(uploadsDir, filename);

          await fs.writeFile(filePath, buffer);

          return NextResponse.json({
            success: true,
            url: `/uploads/${filename}`,
            public_id: `${folder}/${filename}`,
            isLocal: true,
            cloudinaryError: b64Message || cloudMessage,
            message: `Cloudinary error: ${b64Message || cloudMessage}. Stored locally in /uploads.`,
          });
        }
      }
    }

    // Fallback if Cloudinary is not configured at all
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `${Date.now()}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/${filename}`,
      public_id: `${folder}/${filename}`,
      isLocal: true,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    console.error('File upload fatal error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
