'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Truck, Headphones, CheckCircle2 } from 'lucide-react';

export default function HeroSection({ onOpenQuote }: { onOpenQuote?: () => void }) {
  return (
    <section className="relative bg-[#071326] text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading, Subtitle & CTAs */}
          <div className="lg:col-span-7 space-y-6 z-10">
            {/* Tag / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-400 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>WHOLESALE & RETAIL</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Your Trusted <br />
              Partner for <br />
              <span className="text-sky-400 drop-shadow-sm">Every Connection.</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              Elnix Powerzone supplies high quality electrical, battery, plumbing and sanitary products for homes, buildings and businesses across Kerala.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/locations"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm backdrop-blur-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>Visit Our Store</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Showroom Image with modern overlay */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-slate-900 aspect-4/3 lg:aspect-5/4 group">
              <img
                src="/images/hero-powerzone.jpg"
                alt="Elnix Powerzone Commercial Power Systems & Solar Showroom"
                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071326] via-transparent to-transparent opacity-80" />
              
              {/* Floating Badge on Image */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                    Eruvely Showroom
                  </div>
                  <div className="text-sm font-semibold text-white">
                    Batteries • Electricals • Plumbing • Sanitary
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Open Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Feature Strip (Translucent dark bar with 4 metrics) */}
        <div className="mt-14 pt-8 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Genuine Products
                </div>
                <div className="text-xs text-slate-400">
                  Trusted Brands
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Wholesale & Retail
                </div>
                <div className="text-xs text-slate-400">
                  Competitive Pricing
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Expert Support
                </div>
                <div className="text-xs text-slate-400">
                  For Homes & Projects
                </div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-400 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white leading-snug">
                  Convenient Location
                </div>
                <div className="text-xs text-slate-400">
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

