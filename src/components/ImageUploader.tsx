'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmationModal from './ConfirmationModal';

interface ImageUploaderProps {
  value?: string;
  publicId?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
  className?: string;
}

export default function ImageUploader({
  value,
  publicId,
  onChange,
  folder = 'elnix_powerzone',
  label = 'Upload Image',
  helpText = 'Supports PNG, JPG, WEBP up to 5MB (Drag & drop or click Browse)',
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, WEBP).',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Max image size allowed is 5MB.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    const toastId = toast.loading('Uploading image to Cloudinary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      setUploadProgress(60);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setUploadProgress(100);
        onChange(data.url, data.public_id);
        toast.success('Image uploaded successfully!', {
          id: toastId,
          description: data.isDemo
            ? 'Preview saved (Cloudinary ready).'
            : 'Stored securely in Cloudinary.',
        });
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error('Upload failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading('Deleting image from Cloudinary...');

    try {
      if (publicId) {
        const res = await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to delete');
      }

      onChange('', '');
      toast.success('Image deleted successfully', { id: toastId });
      setShowDeleteModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      toast.error('Error deleting image', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}

      {/* When Image already exists */}
      {value ? (
        <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-3">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
            />
            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-md hover:bg-slate-50 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Change Image
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3.5 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-md hover:bg-red-700 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Image
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cloudinary Stored
            </span>
            {publicId && (
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                {publicId}
              </span>
            )}
          </div>
        </div>
      ) : (
        /* Drag & Drop + Browse File Area */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
            isDragging
              ? 'border-sky-500 bg-sky-50/70 scale-[1.01]'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'
              }`}
            >
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-800">
                Drag and drop your image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-600 hover:text-sky-700 underline font-bold cursor-pointer"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs text-slate-500">{helpText}</p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-1 px-4 py-2 bg-white text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              Choose File
            </button>

            {isUploading && (
              <div className="w-full max-w-xs mt-3">
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-600 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Uploading to Cloudinary...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Image from Cloudinary?"
        message="This action will permanently delete this image asset from Cloudinary storage and cannot be undone."
        itemPreviewUrl={value}
        itemTitle={publicId || 'Selected Image'}
        confirmLabel="Yes, Delete Image"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

