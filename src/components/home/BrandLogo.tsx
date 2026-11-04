'use client';

import React, { useState } from 'react';
import { Brand } from '@/types';
import { isUnrelatedBrandImage, getAuthenticBrandSvg } from '@/lib/brandLogos';

interface BrandLogoProps {
  brand: Brand;
  className?: string;
  imgClassName?: string;
}

export default function BrandLogo({ brand, className = '', imgClassName = '' }: BrandLogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const name = brand.name || '';
  const rawUrl = brand.logo_url?.trim() || '';

  // Determine if rawUrl is an unrelated stock image (Unsplash) or broken hotlink (Wikimedia 400)
  const isUnrelated = isUnrelatedBrandImage(rawUrl);

  // If a valid uploaded/custom image exists and has not failed
  const useDirectImage = Boolean(rawUrl && !imageFailed && !isUnrelated);

  // Authentic fallback vector SVG matching Reference Image 2
  const authenticSvg = getAuthenticBrandSvg(brand.slug || brand.name || '');

  // 1. Direct valid image (e.g. Cloudinary upload, valid CDN, or local file)
  if (useDirectImage) {
    return (
      <img
        src={rawUrl}
        alt={name}
        onError={() => setImageFailed(true)}
        className={`max-h-7 sm:max-h-8 max-w-[85px] sm:max-w-[105px] w-auto h-auto object-contain transition-transform group-hover:scale-105 select-none ${imgClassName} ${className}`}
      />
    );
  }

  // 2. Authentic Vector SVG logo (Amaron, Exide, Luminous, V-Guard, Racold, Bosch, etc.)
  if (authenticSvg) {
    return (
      <img
        src={authenticSvg}
        alt={name}
        className={`max-h-7 sm:max-h-8 max-w-[85px] sm:max-w-[105px] w-auto h-auto object-contain transition-transform group-hover:scale-105 select-none ${imgClassName} ${className}`}
      />
    );
  }

  // 3. Graceful text badge fallback for unknown custom brands without logos
  return (
    <span
      className={`font-black text-slate-800 text-xs sm:text-sm tracking-wider uppercase text-center line-clamp-1 select-none px-2 py-1 rounded bg-slate-100 ${className}`}
    >
      {name}
    </span>
  );
}
