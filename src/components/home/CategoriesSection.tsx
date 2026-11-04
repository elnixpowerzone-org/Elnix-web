'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Category, Brand } from '@/types';
import CategoryIcon from './CategoryIcon';
import BrandLogo from './BrandLogo';

interface CategoriesSectionProps {
  categories: Category[];
  brands?: Brand[];
}

function CategoryCardImage({ src, alt, icon }: { src?: string; alt: string; icon?: string }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-50/80 to-slate-100 text-slate-400 p-4">
        <CategoryIcon icon={icon} name={alt} className="w-10 h-10 text-sky-500/80 mb-2" />
        <span className="text-xs font-bold text-slate-600 line-clamp-1 text-center">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImageFailed(true)}
      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export default function CategoriesSection({ categories, brands = [] }: CategoriesSectionProps) {
  // Only show categories that are marked visible, fixed / maximum 5 cards for the homepage
  const visibleCategories = categories.filter((c) => c.is_visible !== false);
  const displayCategories = visibleCategories.slice(0, 5);

  // Only show brands marked for homepage (is_channel_partner !== false)
  const visibleBrands = brands.filter((b) => b.is_channel_partner !== false);

  const [isMarqueePaused, setIsMarqueePaused] = useState(false);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);

  // Manual scroll handler for indicator buttons
  const scrollBrands = () => {
    if (!marqueeContainerRef.current) return;
    marqueeContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
  };

  // Ensure sufficient duplicate items for a seamless visual loop without blank gaps
  const baseBrands = visibleBrands.length > 0 ? visibleBrands : [];
  // Ensure we have at least 8 items in the sequence before creating the duplicate loop
  let loopedSequence = [...baseBrands];
  while (loopedSequence.length > 0 && loopedSequence.length < 8) {
    loopedSequence = [...loopedSequence, ...baseBrands];
  }

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
              OUR PRODUCT CATEGORIES
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-black text-slate-900 tracking-tight leading-tight">
              Explore Our Product Range.
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl leading-relaxed">
              Complete power and home solutions for residential, commercial and project needs.
            </p>
          </div>

          {/* Header Action */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-50/90 hover:bg-sky-100 text-sky-700 font-bold text-xs sm:text-sm border border-sky-100/90 shadow-2xs hover:shadow-xs transition-all group shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Row (Fixed / Maximum 5 Cards in a Balanced 5-Column Grid on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {displayCategories.map((cat) => {
            const targetUrl = cat.custom_url || `/products?category=${cat.slug || cat.id}`;

            return (
              <div
                key={cat.id || cat.slug}
                className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5"
              >
                <Link href={targetUrl} className="flex flex-col h-full">
                  {/* Category Image Area - Edge-to-edge full bleed with rounded top corners */}
                  <div className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden shrink-0">
                    <CategoryCardImage
                      src={cat.image_url}
                      alt={cat.name}
                      icon={cat.icon}
                    />
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-white">
                    <div>
                      {/* Icon + Title */}
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <CategoryIcon
                          icon={cat.icon}
                          name={cat.name}
                          className="w-5 h-5 text-sky-600 shrink-0"
                        />
                        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg group-hover:text-sky-600 transition-colors line-clamp-1">
                          {cat.name}
                        </h3>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-[13px] text-slate-500 line-clamp-2 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    {/* Arrow Action */}
                    <div className="flex justify-end mt-4 pt-1">
                      <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white flex items-center justify-center transition-all shadow-2xs group-hover:shadow-sm">
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Integrated Brands Row Directly Below Categories */}
        {visibleBrands.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-[#f8fafc] rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-6">
            {/* Left Header */}
            <div className="shrink-0 flex items-center justify-between lg:block">
              <div>
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-sky-600 uppercase block">
                  OUR TRUSTED BRANDS
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight mt-0.5">
                  Authorised Sales &amp; Service Partner
                </h4>
              </div>

              {/* Mobile Scroll Indicator Button */}
              <button
                type="button"
                aria-label="Scroll brands"
                onClick={scrollBrands}
                className="lg:hidden w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-slate-600 hover:text-sky-600 active:scale-95 transition-all cursor-pointer shrink-0 ml-2"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Vertical Divider (Desktop) */}
            <div className="hidden lg:block h-10 w-px bg-slate-200 mx-1 shrink-0" />

            {/* Continuous Horizontal Auto-Scrolling Track */}
            <div
              ref={marqueeContainerRef}
              className="brand-marquee-container flex items-center gap-3 overflow-hidden flex-1 relative select-none"
              onMouseEnter={() => setIsMarqueePaused(true)}
              onMouseLeave={() => setIsMarqueePaused(false)}
              onTouchStart={() => setIsMarqueePaused(true)}
              onTouchEnd={() => setIsMarqueePaused(false)}
            >
              <div
                className="brand-marquee-track flex items-center gap-3 sm:gap-4 py-1"
                style={{
                  animationPlayState: isMarqueePaused ? 'paused' : 'running',
                }}
              >
                {/* Track Sequence 1 (Primary) */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  {loopedSequence.map((b, idx) => {
                    const href = b.website?.startsWith('http')
                      ? b.website
                      : `/products?brand=${b.slug || b.id}`;
                    const isExternal = Boolean(b.website?.startsWith('http'));

                    return (
                      <a
                        key={`b1-${b.id || b.slug}-${idx}`}
                        href={href}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        title={b.name}
                        className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all px-4 sm:px-6 py-2.5 sm:py-3 h-14 sm:h-16 flex items-center justify-center min-w-[120px] sm:min-w-[135px] shrink-0 group cursor-pointer"
                      >
                        <BrandLogo brand={b} />
                      </a>
                    );
                  })}
                </div>

                {/* Track Sequence 2 (Duplicate for Seamless Infinite Visual Looping) */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0" aria-hidden="true">
                  {loopedSequence.map((b, idx) => {
                    const href = b.website?.startsWith('http')
                      ? b.website
                      : `/products?brand=${b.slug || b.id}`;
                    const isExternal = Boolean(b.website?.startsWith('http'));

                    return (
                      <a
                        key={`b2-${b.id || b.slug}-${idx}`}
                        href={href}
                        tabIndex={-1}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        title={b.name}
                        className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all px-4 sm:px-6 py-2.5 sm:py-3 h-14 sm:h-16 flex items-center justify-center min-w-[120px] sm:min-w-[135px] shrink-0 group cursor-pointer"
                      >
                        <BrandLogo brand={b} />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Desktop Scroll Next Button */}
              <button
                type="button"
                aria-label="Scroll brands right"
                onClick={scrollBrands}
                className="hidden lg:flex w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 active:scale-95 transition-all cursor-pointer shrink-0 ml-1 z-10"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
