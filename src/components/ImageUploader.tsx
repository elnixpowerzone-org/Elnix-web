'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle, RefreshCw, Link as LinkIcon } from 'lucide-react';
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
  helpText = 'Supports PNG, JPG, WEBP, SVG up to 5MB (Drag & drop, browse, or enter URL)',
  className = '',
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.svg')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (PNG, JPG, WEBP, SVG).',
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
        setPreviewError(false);
        setManualUrl(data.url);
        onChange(data.url, data.public_id);
        toast.success('Image uploaded successfully!', {
          id: toastId,
          description: data.isLocal
            ? 'Stored locally in /uploads (Cloudinary fallback).'
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

  const handleApplyManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) {
      toast.error('Please enter an image URL');
      return;
    }
    setPreviewError(false);
    onChange(trimmed, '');
    setShowUrlInput(false);
    toast.success('Image URL applied');
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const toastId = toast.loading('Removing image...');

    try {
      if (publicId && !value?.startsWith('data:')) {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: publicId }),
        });
      }

      setManualUrl('');
      setPreviewError(false);
      onChange('', '');
      toast.success('Image removed successfully', { id: toastId });
      setShowDeleteModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Remove failed';
      toast.error('Error removing image', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine storage status text
  const isCloudinary = Boolean(publicId || (value && value.includes('res.cloudinary.com')));
  const isSvgDataUri = Boolean(value && value.startsWith('data:image/svg+xml'));
  const isLocalFile = Boolean(value && (value.startsWith('/images/') || value.startsWith('/uploads/')));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2">
        {label && (
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => {
            setShowUrlInput(!showUrlInput);
            setManualUrl(value || '');
          }}
          className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showUrlInput ? 'Back to upload' : 'Enter URL manually'}</span>
        </button>
      </div>

      {/* Manual URL Input Form */}
      {showUrlInput && (
        <form onSubmit={handleApplyManualUrl} className="mb-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <label className="block text-[11px] font-bold text-slate-600">
            Paste Direct Image or SVG URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://... or data:image/svg+xml;..."
              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              Apply
            </button>
          </div>
        </form>
      )}

      {/* When Image already exists */}
      {value ? (
        <div className="relative group border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 p-3">
          <div className="relative min-h-[140px] max-h-[180px] w-full rounded-xl overflow-hidden bg-white flex items-center justify-center border border-slate-200 p-4">
            {previewError ? (
              <div className="flex flex-col items-center justify-center p-4 text-center text-amber-700">
                <AlertCircle className="w-8 h-8 text-amber-500 mb-1" />
                <span className="text-xs font-bold">Image Failed to Load</span>
                <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-xs">{value}</span>
              </div>
            ) : (
              <img
                src={value}
                alt="Uploaded Preview"
                onError={() => setPreviewError(true)}
                className="max-h-[130px] max-w-full object-contain transition-transform duration-300 group-hover:scale-102"
              />
            )}

            {/* Overlay buttons */}
            <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-md hover:bg-slate-50 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Replace
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-md hover:bg-red-700 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 px-1">
            <span
              className={`flex items-center gap-1.5 font-medium ${
                isCloudinary ? 'text-emerald-600' : isSvgDataUri ? 'text-indigo-600' : 'text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {isCloudinary
                ? 'Cloudinary Stored'
                : isSvgDataUri
                ? 'Authentic Vector SVG'
                : isLocalFile
                ? 'Local Asset'
                : 'External Image URL'}
            </span>
            {publicId && (
              <span className="font-mono text-[10px] text-slate-400 truncate max-w-[180px]">
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
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                isDragging ? 'bg-sky-500 text-white' : 'bg-sky-100 text-sky-600'
              }`}
            >
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800">
                Drag and drop your image here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sky-600 hover:text-sky-700 underline font-bold cursor-pointer"
                >
                  browse files
                </button>
              </p>
              <p className="text-[11px] text-slate-500">{helpText}</p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="mt-1 px-3.5 py-1.5 bg-white text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
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
        accept="image/*,.svg"
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
        title="Remove Selected Image?"
        message="Are you sure you want to remove this image?"
        itemPreviewUrl={value}
        itemTitle={publicId || 'Selected Image'}
        confirmLabel="Yes, Remove Image"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
