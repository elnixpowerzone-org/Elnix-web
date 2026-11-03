'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Category, Brand } from '@/types';
import CategoryIcon from './CategoryIcon';
import BrandLogo from './BrandLogo';

interface CategoriesSectionProps {
  categories: Category[];
  brands?: Brand[];
}

export default function CategoriesSection({ categories, brands = [] }: CategoriesSectionProps) {
  // Only show categories that are marked visible
  const visibleCategories = categories.filter((c) => c.is_visible !== false);
  // Only show brands marked for homepage (is_channel_partner !== false)
  const visibleBrands = brands.filter((b) => b.is_channel_partner !== false);

  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const brandsScrollRef = useRef<HTMLDivElement>(null);

  const [canScrollCatLeft, setCanScrollCatLeft] = useState(false);
  const [canScrollCatRight, setCanScrollCatRight] = useState(false);

  // Check category scroll bounds
  const updateCatScrollBounds = () => {
    if (!categoriesScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = categoriesScrollRef.current;
    setCanScrollCatLeft(scrollLeft > 10);
    setCanScrollCatRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateCatScrollBounds();
    const el = categoriesScrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', updateCatScrollBounds, { passive: true });
    window.addEventListener('resize', updateCatScrollBounds);

    return () => {
      el.removeEventListener('scroll', updateCatScrollBounds);
      window.removeEventListener('resize', updateCatScrollBounds);
    };
  }, [visibleCategories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    if (!categoriesScrollRef.current) return;
    const offset = direction === 'left' ? -300 : 300;
    categoriesScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const scrollBrands = () => {
    if (!brandsScrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = brandsScrollRef.current;
    // If at or near the end, loop back smoothly, otherwise scroll right
    if (scrollLeft + clientWidth >= scrollWidth - 20) {
      brandsScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      brandsScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

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

          {/* Header Action & Desktop Nav Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            {/* Desktop scroll arrows if more items exceed width */}
            <div className="hidden sm:flex items-center gap-1.5 mr-1">
              <button
                type="button"
                aria-label="Scroll categories left"
                onClick={() => scrollCategories('left')}
                disabled={!canScrollCatLeft}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Scroll categories right"
                onClick={() => scrollCategories('right')}
                disabled={!canScrollCatRight}
                className="w-9 h-9 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-2xs"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-sky-50/90 hover:bg-sky-100 text-sky-700 font-bold text-xs sm:text-sm border border-sky-100/90 shadow-2xs hover:shadow-xs transition-all group shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Row (Horizontal layout with smooth swipe / scroll) */}
        <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
          <div
            ref={categoriesScrollRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {visibleCategories.map((cat) => {
              const targetUrl = cat.custom_url || `/products?category=${cat.slug || cat.id}`;

              return (
                <div
                  key={cat.id}
                  className="w-[260px] sm:w-[275px] lg:min-w-[215px] lg:flex-1 shrink-0 snap-start bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1.5"
                >
                  <Link href={targetUrl} className="flex flex-col h-full">
                    {/* Category Image Area */}
                    <div className="relative h-44 sm:h-48 w-full bg-gradient-to-b from-sky-50/70 via-slate-50/40 to-slate-100/60 p-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={cat.image_url}
                        alt={cat.name}
                        className="w-full h-full object-contain sm:object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex-1 flex flex-col justify-between bg-white">
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

            {/* Right Brand Cards Horizontal Scroll */}
            <div className="flex items-center gap-3 overflow-hidden flex-1">
              <div
                ref={brandsScrollRef}
                className="flex items-center gap-3 sm:gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x py-1 flex-1"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {visibleBrands.map((b) => {
                  const href = b.website?.startsWith('http')
                    ? b.website
                    : `/products?brand=${b.slug || b.id}`;
                  const isExternal = Boolean(b.website?.startsWith('http'));

                  return (
                    <a
                      key={b.id}
                      href={href}
                      target={isExternal ? '_blank' : undefined}
                      rel={isExternal ? 'noopener noreferrer' : undefined}
                      title={b.name}
                      className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all px-4 sm:px-6 py-2.5 sm:py-3 h-14 sm:h-16 flex items-center justify-center min-w-[120px] sm:min-w-[135px] shrink-0 snap-start group cursor-pointer"
                    >
                      <BrandLogo brand={b} />
                    </a>
                  );
                })}
              </div>

              {/* Desktop Scroll Next Button */}
              <button
                type="button"
                aria-label="Scroll brands right"
                onClick={scrollBrands}
                className="hidden lg:flex w-8 h-8 rounded-full bg-white border border-slate-200 shadow-2xs items-center justify-center text-slate-600 hover:text-sky-600 hover:border-sky-300 active:scale-95 transition-all cursor-pointer shrink-0 ml-1"
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
