'use client';

import React, { useState } from 'react';
import { Brand } from '@/types';

interface BrandLogoProps {
  brand: Brand;
  className?: string;
}

export default function BrandLogo({ brand, className = '' }: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = brand.name || '';
  const norm = name.toLowerCase().trim();

  // If a valid image URL is present and has not errored
  const hasImage = Boolean(brand.logo_url && !imageFailed && !brand.logo_url.includes('placeholder'));

  // Custom styled badges that match Reference Image 1 & authentic branding
  if (!hasImage || imageFailed) {
    if (norm === 'amaron') {
      return (
        <div className={`px-2.5 py-1 rounded-md bg-[#74b433] text-black font-black text-xs sm:text-sm tracking-wider uppercase select-none flex items-center justify-center ${className}`}>
          AMARON
        </div>
      );
    }
    if (norm === 'exide') {
      return (
        <div className={`flex items-center gap-1 select-none ${className}`}>
          <div className="w-3.5 h-3.5 rounded-full bg-blue-700 flex items-center justify-center text-white text-[9px] font-black leading-none">
            ⚡
          </div>
          <span className="font-black text-red-600 text-sm sm:text-base tracking-tight uppercase">
            EXIDE
          </span>
        </div>
      );
    }
    if (norm === 'luminous') {
      return (
        <div className={`px-2.5 py-1 rounded bg-[#0b3b82] text-white font-black text-xs sm:text-sm tracking-wider uppercase select-none flex items-center justify-center ${className}`}>
          LUMINOUS
        </div>
      );
    }
    if (norm === 'v-guard') {
      return (
        <div className={`px-2.5 py-1 rounded bg-black text-[#eab308] font-black text-xs sm:text-sm tracking-wider uppercase select-none flex items-center justify-center border border-slate-800 ${className}`}>
          V-GUARD
        </div>
      );
    }
    if (norm === 'racold') {
      return (
        <div className={`px-2.5 py-1 rounded bg-red-600 text-white font-black text-xs sm:text-sm tracking-tight select-none flex items-center gap-1 ${className}`}>
          <span className="text-[10px]">♨</span>
          <span>Racold</span>
        </div>
      );
    }
    if (norm.includes('bosch')) {
      return (
        <span className={`font-black text-red-600 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          BOSCH
        </span>
      );
    }
    if (norm.includes('sonic')) {
      return (
        <span className={`font-black text-blue-700 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          SF SONIC
        </span>
      );
    }
    if (norm.includes('livguard')) {
      return (
        <span className={`font-black text-orange-600 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          Livguard
        </span>
      );
    }
    if (norm.includes('finolex')) {
      return (
        <span className={`font-black text-red-600 text-xs sm:text-sm tracking-wide select-none ${className}`}>
          Finolex
        </span>
      );
    }
    if (norm.includes('rr kabel')) {
      return (
        <span className={`font-black text-blue-800 text-xs sm:text-sm tracking-wide select-none ${className}`}>
          RR KABEL
        </span>
      );
    }
    if (norm.includes('polycab')) {
      return (
        <span className={`font-black text-red-700 text-xs sm:text-sm tracking-wide select-none ${className}`}>
          POLYCAB
        </span>
      );
    }
    if (norm.includes('cera')) {
      return (
        <span className={`font-black text-cyan-700 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          CERA
        </span>
      );
    }
    if (norm.includes('somany')) {
      return (
        <span className={`font-black text-red-600 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          SOMANY
        </span>
      );
    }
    if (norm.includes('jaquar')) {
      return (
        <span className={`font-black text-emerald-800 text-xs sm:text-sm tracking-wider select-none ${className}`}>
          Jaquar
        </span>
      );
    }

    // Generic fallback for custom brands
    return (
      <span className={`font-bold text-slate-800 text-xs sm:text-sm tracking-tight text-center line-clamp-1 select-none ${className}`}>
        {name}
      </span>
    );
  }

  return (
    <img
      src={brand.logo_url}
      alt={brand.name}
      onError={() => setImageFailed(true)}
      className={`max-h-7 sm:max-h-8 max-w-[85px] sm:max-w-[105px] object-contain transition-transform group-hover:scale-105 ${className}`}
    />
  );
}

