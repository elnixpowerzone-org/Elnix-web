'use client';

import React from 'react';
import { Brand } from '@/types';
import BrandLogo from './BrandLogo';
import { initialBrands } from '@/data/initialData';

interface BrandsSectionProps {
  brands?: Brand[];
}

export default function BrandsSection({ brands = [] }: BrandsSectionProps) {
  // Use dynamic brands from backend (filtered by channel partner status), with initial fallback
  const rawBrands = brands && brands.length > 0 ? brands : initialBrands;
  const activeBrands = rawBrands.filter((b) => b.is_channel_partner !== false);
  const displayBrands = activeBrands.length > 0 ? activeBrands : rawBrands;

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Brands You Know. Quality You Trust.
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            We supply products from leading national and international brands.
          </p>
        </div>

        {/* Brands Grid (dynamic data from backend) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {displayBrands.map((b, idx) => {
            const href = b.website?.startsWith('http')
              ? b.website
              : `/products?brand=${b.slug || b.id}`;
            const isExternal = Boolean(b.website?.startsWith('http'));

            return (
              <a
                key={b.id || idx}
                href={href}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:bg-slate-50/80 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all duration-300 flex flex-col items-center justify-center min-h-[105px] text-center group cursor-pointer"
                title={b.name}
              >
                <div className="h-10 flex items-center justify-center w-full">
                  <BrandLogo brand={b} imgClassName="max-h-8 max-w-[110px]" />
                </div>
                <span className="text-xs font-bold text-slate-700 mt-2 line-clamp-1 group-hover:text-sky-600 transition-colors">
                  {b.name}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

