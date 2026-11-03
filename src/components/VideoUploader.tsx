'use client';

import React, { useState, useRef } from 'react';
import { 
  Film, 
  UploadCloud, 
  Trash2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoUploaderProps {
  value?: string;
  publicId?: string;
  posterUrl?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  helpText?: string;
}

const SAMPLE_PRESETS = [
  {
    name: 'Dark Abstract Fluid (Mixkit 720p)',
    url: 'https://assets.mixkit.co/videos/48870/48870-720.mp4',
    desc: 'Deep blue and dark flowing fluid particles',
  },
  {
    name: 'Dark Laser Lines & Tech Glow',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-laser-lights-background-40748-large.mp4',
    desc: 'High-tech dark background with subtle laser paths',
  },
  {
    name: 'Digital Connection Dots',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-connection-dots-and-lines-41551-large.mp4',
    desc: 'Network nodes and connection points in dark space',
  },
];

export default function VideoUploader({
  value = '',
  publicId = '',
  posterUrl = '',
  onChange,
  folder = 'elnix_powerzone/hero',
  label = 'Hero Background Video',
  helpText = 'Upload an MP4, WebM, or MOV video file (up to 100MB), or paste a direct video URL.',
}: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [manualUrl, setManualUrl] = useState(value);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);
    if (!isVideo) {
      toast.error('Invalid video file', {
        description: 'Please upload an MP4, WebM, MOV, or OGG video file.',
      });
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum video upload size is 100MB.',
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    const toastId = toast.loading('Uploading video to Cloudinary...', {
      description: 'Transferring video file and preparing infinite loop playback.',
    });

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      let uploadSuccess = false;
      let finalUrl = '';
      let finalPublicId = '';

      // Method 1: Direct Client-to-Cloudinary Upload (bypasses Vercel server payload limits & supports real upload progress)
      if (cloudName && uploadPreset) {
        try {
          const directData = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 95);
                setUploadProgress(percent);
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const res = JSON.parse(xhr.responseText);
                  if (res.secure_url) {
                    resolve(res);
                  } else {
                    reject(new Error('No secure_url returned by Cloudinary'));
                  }
                } catch (err) {
                  reject(err);
                }
              } else {
                reject(new Error(`Cloudinary upload failed: ${xhr.statusText}`));
              }
            };

            xhr.onerror = () => reject(new Error('Network error during direct Cloudinary upload'));

            const cFormData = new FormData();
            cFormData.append('file', file);
            cFormData.append('upload_preset', uploadPreset);
            cFormData.append('folder', folder);
            xhr.send(cFormData);
          });

          finalUrl = directData.secure_url;
          finalPublicId = directData.public_id;
          uploadSuccess = true;
        } catch (directErr) {
          console.warn('Direct Cloudinary upload failed, falling back to server upload route:', directErr);
        }
      }

      // Method 2: Server Route Upload Fallback (/api/upload -> Cloudinary SDK)
      if (!uploadSuccess) {
        setUploadProgress(30);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const progressTimer = setInterval(() => {
          setUploadProgress((prev) => (prev < 90 ? prev + 15 : prev));
        }, 400);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressTimer);
        const data = await res.json();

        let serverResponseData: { url: string; public_id: string; isLocal?: boolean; cloudinaryError?: string; message?: string } | null = null;
        if (res.ok && data.success) {
          finalUrl = data.url;
          finalPublicId = data.public_id;
          uploadSuccess = true;
          serverResponseData = data;
        } else {
          throw new Error(data.error || 'Server upload failed');
        }

        if (uploadSuccess && finalUrl) {
          setUploadProgress(100);
          onChange(finalUrl, finalPublicId);
          setManualUrl(finalUrl);

          if (finalUrl.includes('cloudinary.com')) {
            toast.success('Hero video uploaded to Cloudinary!', {
              id: toastId,
              description: 'Stored securely in your Cloudinary CDN media library.',
            });
          } else {
            toast.warning('Saved to local /uploads', {
              id: toastId,
              description: serverResponseData?.cloudinaryError
                ? `Cloudinary note: ${serverResponseData.cloudinaryError}`
                : 'Video saved in project /public/uploads directory.',
            });
          }
          return;
        }
      }

      if (uploadSuccess && finalUrl) {
        setUploadProgress(100);
        onChange(finalUrl, finalPublicId);
        setManualUrl(finalUrl);
        toast.success('Hero video uploaded to Cloudinary!', {
          id: toastId,
          description: 'Stored securely in your Cloudinary media library.',
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      toast.error('Video upload failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = () => {
    if (!manualUrl.trim()) {
      toast.error('Please enter a valid video URL');
      return;
    }
    onChange(manualUrl.trim(), '');
    toast.success('Video URL applied to Hero Section');
  };

  const handleApplyPreset = (presetUrl: string, name: string) => {
    setManualUrl(presetUrl);
    onChange(presetUrl, '');
    toast.success(`Preset applied: ${name}`);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-sm font-bold text-slate-800">
            {label}
          </label>
          <p className="text-xs text-slate-500 mt-0.5">{helpText}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1.5 transition-colors"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInput ? 'Hide URL Input' : 'Enter Direct URL'}</span>
        </button>
      </div>

      {/* Manual URL Input drawer */}
      {showUrlInput && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Direct Video URL (.mp4 / .webm or CDN link)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://example.com/videos/hero.mp4 or /uploads/video.mp4"
              className="flex-1 px-3.5 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              Apply URL
            </button>
          </div>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block mb-2">
              Ready-to-use Dark Themed Background Loops:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.url, p.name)}
                  className="px-2.5 py-1.5 bg-white hover:bg-sky-50 border border-slate-200 hover:border-sky-300 rounded-lg text-[11px] font-medium text-slate-700 hover:text-sky-700 flex items-center gap-1.5 transition-all text-left"
                  title={p.desc}
                >
                  <Sparkles className="w-3 h-3 text-sky-500" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* If Video already exists: show preview player */}
      {value ? (
        <div className="relative border border-slate-200 rounded-2xl overflow-hidden bg-slate-950 shadow-md">
          <div className="relative aspect-video max-h-[380px] w-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={value}
              poster={posterUrl}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Video Overlay Info & Badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active Hero Video</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-sky-300 text-[11px] font-semibold flex items-center gap-1 border border-white/10 backdrop-blur-xs">
                <RefreshCw className="w-3 h-3 animate-spin duration-3000" />
                <span>Infinite Loop Enabled</span>
              </span>
            </div>

            {/* Controls Bar at Bottom */}
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <span className="text-xs text-slate-300 truncate max-w-xs sm:max-w-md font-mono">
                  {value}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs"
                >
                  Replace Video
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange('', '');
                    setManualUrl('');
                  }}
                  className="p-2 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition-colors"
                  title="Remove Video"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Video Upload Drop Area */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileSelect(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-sky-500 bg-sky-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-sky-400 bg-slate-50/60 hover:bg-slate-50'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Film className="w-7 h-7" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Upload Background Video for Hero Section
          </h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
            Drag & drop an MP4, WebM or MOV video here, or click to browse files.
            The video will automatically autoplay and loop infinitely.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-bold shadow-xs hover:bg-sky-400 transition-all">
            <UploadCloud className="w-4 h-4" />
            <span>Choose Video File</span>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
          }
        }}
      />

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-sky-900">
            <span>Uploading and processing video...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full h-2 bg-sky-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-sky-600 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-[11px] text-sky-700">
            Please wait while the video stream is safely transferred.
          </p>
        </div>
      )}
    </div>
  );
}

