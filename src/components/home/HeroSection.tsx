'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowRight, 
  MapPin, 
  ShieldCheck, 
  Truck, 
  Headphones, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { HeroSettings } from '@/types';
import { initialHeroSettings } from '@/data/initialData';

export default function HeroSection({ 
  hero: initialHero,
  onOpenQuote 
}: { 
  hero?: HeroSettings;
  onOpenQuote?: () => void;
}) {
  const [hero, setHero] = useState<HeroSettings>(initialHero || initialHeroSettings);

  // Always ensure sync with latest saved hero data from API on client
  useEffect(() => {
    if (initialHero) {
      setHero(initialHero);
    }
    fetch('/api/hero', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.video_url) {
          setHero(data.data);
        }
      })
      .catch(() => {});
  }, [initialHero]);

  const opacityValue = hero.overlay_opacity ?? 40;
  // Calculate left gradient dark factor (strong enough to keep text readable, but transparent towards center/right)
  const leftDark = Math.min(0.88, (opacityValue / 100) * 1.7);
  const midDark = Math.min(0.65, (opacityValue / 100) * 1.1);
  const rightDark = Math.min(0.45, (opacityValue / 100) * 0.5);

  const customPoster = hero.poster_url && hero.poster_url !== '/images/hero-powerzone.jpg' ? hero.poster_url : undefined;

  return (
    <section className="relative min-h-[640px] lg:min-h-[720px] bg-[#071326] text-white overflow-hidden flex flex-col justify-between">
      {/* 1. Full-Coverage Background Video Loop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none bg-[#071326]">
        {hero.video_url ? (
          <video
            key={hero.video_url}
            autoPlay
            loop
            muted
            playsInline
            {...(customPoster ? { poster: customPoster } : {})}
            className="w-full h-full object-cover object-center transform scale-105 transition-opacity duration-1000"
          >
            <source src={hero.video_url} type="video/mp4" />
            <source src={hero.video_url} type="video/webm" />
          </video>
        ) : (
          <div className="w-full h-full bg-[#071326]" />
        )}
      </div>

      {/* 2. Tuned Directional & Vertical Light-Dark Gradient Overlays */}
      {/* Directional gradient: Gently darkens left side behind text, fading out smoothly towards center & right so the dark-themed video details remain clearly visible */}
      <div 
        className="absolute inset-0 z-[1] pointer-events-none transition-all duration-300"
        style={{
          background: `linear-gradient(to right, rgba(7, 19, 38, ${leftDark}) 0%, rgba(7, 19, 38, ${midDark}) 40%, rgba(7, 19, 38, ${rightDark}) 70%, rgba(7, 19, 38, ${rightDark * 0.8}) 100%)`,
        }}
      />

      {/* Soft vertical gradient for smooth navbar blending at top and transition to next section at bottom */}
      <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#071326]/55 via-transparent to-[#071326]/90" />

      {/* Subtle ambient lighting accent */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none z-[1]" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-[1]" />

      {/* 3. Main Hero Content (Left-aligned over the video) */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 lg:pt-24 lg:pb-16 flex-1 flex flex-col justify-center w-full">
        <div className="max-w-3xl space-y-7">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            {hero.headline_line1} <br />
            {hero.headline_line2} <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300">
              {hero.headline_highlight}
            </span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl font-normal leading-relaxed drop-shadow-md">
            {hero.description}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              href={hero.primary_button_link || '/products'}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm tracking-wide shadow-xl shadow-sky-500/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>{hero.primary_button_text || 'Explore Products'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={hero.secondary_button_link || '/locations'}
              className="inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 border border-white/25 text-white font-semibold text-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{hero.secondary_button_text || 'Visit Our Store'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Hero Bottom Feature Strip (Translucent Glass Bar) */}
      <div className="relative z-10 border-t border-white/10 bg-slate-950/45 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Genuine Products
                </div>
                <div className="text-xs text-slate-300">
                  Trusted Brands
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Wholesale & Retail
                </div>
                <div className="text-xs text-slate-300">
                  Competitive Pricing
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Expert Support
                </div>
                <div className="text-xs text-slate-300">
                  For Homes & Projects
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/20 border border-sky-400/30 text-sky-400 flex items-center justify-center shrink-0 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Convenient Location
                </div>
                <div className="text-xs text-slate-300">
                  Eruvely, Chottanikkara
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
