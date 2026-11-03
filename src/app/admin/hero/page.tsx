'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Save, 
  ArrowRight, 
  MapPin, 
  ExternalLink, 
  Eye, 
  Layers, 
  Sliders, 
  Type, 
  Film, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { HeroSettings } from '@/types';
import { initialHeroSettings } from '@/data/initialData';
import VideoUploader from '@/components/VideoUploader';
import ImageUploader from '@/components/ImageUploader';
import { toast } from 'sonner';

export default function AdminHeroPage() {
  const [hero, setHero] = useState<HeroSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'video' | 'content' | 'overlay'>('video');

  const fetchHero = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/hero', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        setHero(data.data);
      } else {
        setHero(initialHeroSettings);
      }
    } catch {
      toast.error('Failed to load hero configuration, using defaults');
      setHero(initialHeroSettings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
  }, []);

  const handleVideoChange = async (url: string, publicId?: string) => {
    if (!hero) return;
    const updated = { ...hero, video_url: url, video_public_id: publicId };
    setHero(updated);

    // Auto-save the new video directly to Supabase immediately upon upload/change
    if (url) {
      try {
        const res = await fetch('/api/hero', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          toast.success('Video saved to database!', {
            description: 'New background video is permanently stored in Supabase.',
          });
        } else {
          throw new Error(data.error || 'Failed to save to database');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error';
        toast.error('Database save issue', {
          description: `${msg}. Did you run the SQL migration in Supabase?`,
        });
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!hero) return;

    setIsSaving(true);
    const toastId = toast.loading('Saving hero section changes...');

    try {
      const res = await fetch('/api/hero', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hero),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setHero(data.data);
        toast.success('Hero Section Updated!', {
          id: toastId,
          description: 'Background video and hero content are now live on the homepage.',
        });
      } else {
        throw new Error(data.error || 'Failed to update hero section');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving hero settings';
      toast.error('Update failed', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset hero settings to default configuration?')) {
      setHero({ ...initialHeroSettings });
      toast.info('Reset to default values. Click "Save Changes" to apply.');
    }
  };

  if (isLoading || !hero) {
    return (
      <div className="p-16 text-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-bold text-slate-500">Loading Hero Section CMS...</p>
      </div>
    );
  }

  const currentOpacity = hero.overlay_opacity ?? 40;

  return (
    <div className="max-w-6xl space-y-8 pb-16">
      {/* Top Banner & Actions */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Film className="w-3.5 h-3.5" />
            <span>HOMEPAGE HERO CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Hero Section & Background Video
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Upload and configure the full-width background video, overlay gradient darkness, left-aligned typography, and action buttons.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Live Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition-colors"
            title="Reset to default settings"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-6 rounded-2xl shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`py-4 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'video'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>1. Background Video</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`py-4 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'content'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Type className="w-4 h-4" />
          <span>2. Headline & Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overlay')}
          className={`py-4 px-4 font-bold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'overlay'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>3. Gradient & Visibility</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* TAB 1: BACKGROUND VIDEO */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900">Video Source & Upload</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an MP4, WebM or MOV file. The video runs as a full-screen background loop with infinite repetition.
                </p>
              </div>

              <VideoUploader
                value={hero.video_url}
                publicId={hero.video_public_id}
                posterUrl={hero.poster_url}
                onChange={handleVideoChange}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              {/* Poster fallback image */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-md space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Poster / Fallback Image</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Displays while the video loads or on power-save devices.
                  </p>
                </div>
                <ImageUploader
                  value={hero.poster_url}
                  onChange={(url) => setHero({ ...hero, poster_url: url })}
                  folder="elnix_powerzone/hero"
                  label="Poster Image"
                  helpText="Recommended: 1920x1080 JPG or WebP"
                />
              </div>

              {/* Best practice tips */}
              <div className="bg-sky-50/60 p-6 rounded-3xl border border-sky-100 space-y-3">
                <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block">
                  PRO TIPS FOR VIDEO HERO
                </span>
                <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <span>Darker videos work best so the white headlines pop with clarity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <span>Seamless loops without sudden jump-cuts provide a cinematic feel.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                    <span>Recommended resolution: 1080p (1920x1080) under 25MB for quick buffering.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HEADLINE & CONTENT */}
        {activeTab === 'content' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Hero Section Content</h3>
              <p className="text-xs text-slate-500 mt-1">
                Customize the badge, headline text lines, paragraph summary, and action button labels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Badge text */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Top Pill Badge Text
                </label>
                <input
                  type="text"
                  required
                  value={hero.badge_text}
                  onChange={(e) => setHero({ ...hero, badge_text: e.target.value })}
                  placeholder="e.g. WHOLESALE & RETAIL"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Headline Line 1 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Headline Line 1
                </label>
                <input
                  type="text"
                  required
                  value={hero.headline_line1}
                  onChange={(e) => setHero({ ...hero, headline_line1: e.target.value })}
                  placeholder="e.g. Your Trusted"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Headline Line 2 */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Headline Line 2
                </label>
                <input
                  type="text"
                  required
                  value={hero.headline_line2}
                  onChange={(e) => setHero({ ...hero, headline_line2: e.target.value })}
                  placeholder="e.g. Partner for"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Headline Highlight */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Headline Highlight (Electric Blue Gradient)
                </label>
                <input
                  type="text"
                  required
                  value={hero.headline_highlight}
                  onChange={(e) => setHero({ ...hero, headline_highlight: e.target.value })}
                  placeholder="e.g. Every Connection."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-sky-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Description Paragraph
                </label>
                <textarea
                  rows={3}
                  required
                  value={hero.description}
                  onChange={(e) => setHero({ ...hero, description: e.target.value })}
                  placeholder="Describe your company and core product offering..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                />
              </div>

              {/* Primary Button */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                  Primary Action Button
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={hero.primary_button_text}
                    onChange={(e) => setHero({ ...hero, primary_button_text: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={hero.primary_button_link}
                    onChange={(e) => setHero({ ...hero, primary_button_link: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
              </div>

              {/* Secondary Button */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
                  Secondary Action Button
                </span>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Button Label</label>
                  <input
                    type="text"
                    value={hero.secondary_button_text}
                    onChange={(e) => setHero({ ...hero, secondary_button_text: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Link URL</label>
                  <input
                    type="text"
                    value={hero.secondary_button_link}
                    onChange={(e) => setHero({ ...hero, secondary_button_link: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: GRADIENT OVERLAY & VISIBILITY */}
        {activeTab === 'overlay' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Gradient Overlay & Video Visibility</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Fine-tune the gradient darkness. Because your video is already dark-themed, keep the overlay light enough so the video stays visible and vibrant while ensuring typography remains sharp.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setHero({ ...hero, overlay_opacity: 28 })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentOpacity <= 32
                    ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900">Subtle (28%)</span>
                  {currentOpacity <= 32 && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Maximum video brightness. Great for naturally dark videos where text is already easy to read.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setHero({ ...hero, overlay_opacity: 40 })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentOpacity > 32 && currentOpacity <= 50
                    ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900">Balanced (40% - Recommended)</span>
                  {currentOpacity > 32 && currentOpacity <= 50 && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Ideal balance: gentle left gradient protects text readability while preserving full video detail.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setHero({ ...hero, overlay_opacity: 60 })}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  currentOpacity > 50
                    ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-black text-slate-900">Deep (60%)</span>
                  {currentOpacity > 50 && <CheckCircle2 className="w-4 h-4 text-sky-500" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Higher contrast. Suitable for videos with brighter spots or rapid motion.
                </p>
              </button>
            </div>

            {/* Custom Slider */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Custom Overlay Darkness: <span className="text-sky-600 font-mono text-sm">{currentOpacity}%</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  {currentOpacity < 35 ? 'Light Gradient' : currentOpacity > 55 ? 'Dark Gradient' : 'Medium-Dark Gradient'}
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={85}
                step={5}
                value={currentOpacity}
                onChange={(e) => setHero({ ...hero, overlay_opacity: Number(e.target.value) })}
                className="w-full accent-sky-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>15% (Very Light)</span>
                <span>40% (Optimal)</span>
                <span>85% (Very Dark)</span>
              </div>
            </div>
          </div>
        )}

        {/* LIVE PREVIEW SECTION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                LIVE INTERACTIVE PREVIEW
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                How It Appears to Visitors
              </h3>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
              Full Width Background Video
            </span>
          </div>

          {/* Embedded Hero Preview Box */}
          <div className="relative rounded-2xl overflow-hidden min-h-[480px] bg-[#071326] text-white flex flex-col justify-between border border-slate-800 shadow-2xl">
            {/* Background Video */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#071326]">
              {hero.video_url ? (
                <video
                  key={hero.video_url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  {...(hero.poster_url && hero.poster_url !== '/images/hero-powerzone.jpg' ? { poster: hero.poster_url } : {})}
                  className="w-full h-full object-cover"
                >
                  <source src={hero.video_url} type="video/mp4" />
                </video>
              ) : (
                <div className="w-full h-full bg-[#071326]" />
              )}
            </div>

            {/* Gradient Overlays */}
            <div
              className="absolute inset-0 z-[1] pointer-events-none transition-all duration-300"
              style={{
                background: `linear-gradient(to right, rgba(7, 19, 38, ${Math.min(0.92, (currentOpacity / 100) * 1.8)}) 0%, rgba(7, 19, 38, ${Math.min(0.7, (currentOpacity / 100) * 1.1)}) 45%, rgba(7, 19, 38, ${(currentOpacity / 100) * 0.4}) 75%, rgba(7, 19, 38, ${(currentOpacity / 100) * 0.6}) 100%)`,
              }}
            />
            <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#071326]/60 via-transparent to-[#071326]/85" />

            {/* Content Preview */}
            <div className="relative z-10 p-6 sm:p-10 max-w-2xl space-y-4 my-auto">
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-[1.12] drop-shadow-md">
                {hero.headline_line1} <br />
                {hero.headline_line2} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300">
                  {hero.headline_highlight}
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed drop-shadow-sm max-w-lg">
                {hero.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25">
                  <span>{hero.primary_button_text}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>

                <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/20 text-white font-semibold text-xs backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{hero.secondary_button_text}</span>
                </span>
              </div>
            </div>

            {/* Bottom Preview Strip */}
            <div className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-md px-6 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] text-slate-300">
                <div>
                  <span className="font-bold text-white block">Genuine Products</span>
                  <span className="text-slate-400 text-[10px]">Trusted Brands</span>
                </div>
                <div>
                  <span className="font-bold text-white block">Wholesale & Retail</span>
                  <span className="text-slate-400 text-[10px]">Competitive Pricing</span>
                </div>
                <div>
                  <span className="font-bold text-white block">Expert Support</span>
                  <span className="text-slate-400 text-[10px]">For Homes & Projects</span>
                </div>
                <div>
                  <span className="font-bold text-white block">Convenient Location</span>
                  <span className="text-slate-400 text-[10px]">Eruvely, Chottanikkara</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="sticky bottom-6 z-20 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              Ready to publish changes to the live storefront?
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save & Publish Live'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

