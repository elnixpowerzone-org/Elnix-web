'use client';

import React from 'react';
import { Brand } from '@/types';

interface BrandsSectionProps {
  brands: Brand[];
}

export default function BrandsSection({ brands }: BrandsSectionProps) {
  // Key partner brands matching the design screenshot
  const partnerBrands = [
    { name: 'EXIDE', tag: 'INDUSTRIES LIMITED', color: 'text-red-600', bg: 'hover:border-red-300' },
    { name: 'SF SONIC', tag: 'POWER THAT LASTS', color: 'text-blue-600', bg: 'hover:border-blue-300' },
    { name: 'BOSCH', tag: 'INVENTED FOR LIFE', color: 'text-red-700', bg: 'hover:border-red-300' },
    { name: 'LUMINOUS', tag: 'INVERTER • UPS • BATTERY', color: 'text-blue-800', bg: 'hover:border-blue-300' },
    { name: 'Livguard', tag: 'ENERGY STORAGE', color: 'text-orange-600', bg: 'hover:border-orange-300' },
    { name: 'V-GUARD', tag: 'BRING HOME A BETTER TOMORROW', color: 'text-yellow-600', bg: 'hover:border-yellow-300' },
    { name: 'Finolex', tag: 'CABLES LIMITED', color: 'text-red-600', bg: 'hover:border-red-300' },
    { name: 'RR Kabel', tag: 'WIRES & CABLES', color: 'text-blue-700', bg: 'hover:border-blue-300' },
    { name: 'POLYCAB', tag: 'WIRES & CABLES', color: 'text-red-600', bg: 'hover:border-red-300' },
    { name: 'CERA', tag: 'SANITARYWARE & TILES', color: 'text-blue-600', bg: 'hover:border-blue-300' },
    { name: 'SOMANY', tag: 'TILES & BATHWARE', color: 'text-red-600', bg: 'hover:border-red-300' },
    { name: 'Jaquar', tag: 'EXPERIENCE BATHING', color: 'text-emerald-700', bg: 'hover:border-emerald-300' },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
            CHANNEL PARTNERS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Brands You Know. Quality You Trust.
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            We supply products from leading national and international brands.
          </p>
        </div>

        {/* Brands Grid (2 rows of 6 cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {partnerBrands.map((b, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50/80 shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center min-h-[90px] text-center group ${b.bg}`}
            >
              <span className={`text-base font-black tracking-tight ${b.color} group-hover:scale-105 transition-transform duration-200`}>
                {b.name}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {b.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

