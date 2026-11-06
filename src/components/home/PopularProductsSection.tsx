'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, MessageCircle } from 'lucide-react';
import { Product } from '@/types';

interface PopularProductsSectionProps {
  products: Product[];
}

export default function PopularProductsSection({ products }: PopularProductsSectionProps) {
  // Filter to show popular products (top 4 items for the homepage)
  const popularOnly = products.filter(p => p.is_popular);
  const popularList = (popularOnly.length > 0 ? popularOnly : products).slice(0, 4);

  return (
            <section className="py-20 bg-slate-50 border-y border-slate-200/60">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      Popular Products
                    </h2>
                    <p className="text-xs sm:text-base text-slate-500 max-w-xl">
                      A selection of our fine product categories from leading brands.
                    </p>
                  </div>

                      <Link
                        href="/products"
                        className="inline-flex items-center gap-1.5 text-sky-600 hover:text-sky-700 font-bold text-xs sm:text-sm shrink-0 hover:underline transition-colors group"
                      >
                        <span className="hidden sm:inline">View All Products</span>
                        <span className="sm:hidden">View All</span>
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
        </div>

                  {/* 4 Products Grid (4 columns on desktop, 2 columns on mobile) */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
                    {popularList.map((product) => {
                      const waUrl = `https://wa.me/918848318521?text=${encodeURIComponent(
                        `Hello Elnix Powerzone, I would like to enquire about "${product.name}". Please share pricing and availability.`
                      )}`;

                      return (
                        <div
                          key={product.id}
                          className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-sky-300 transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Product Image Container: Edge-to-edge top-aligned full fit */}
                          <div className="relative aspect-square w-full bg-slate-100 overflow-hidden shrink-0">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover object-center transform transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Hover action overlay */}
                            <div className="absolute inset-0 bg-[#0b1a30]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                    <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Enquire on WhatsApp"
                                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-transform active:scale-90"
                              >
                              <MessageCircle className="w-4 h-4" />
                            </a>
                            <Link
                              href={`/products/${product.slug}`}
                              title="View Details"
                              className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 transition-transform active:scale-90"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>

                {/* Details & Action */ }
                      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between bg-white">
                        <div className="text-center space-y-1">
                          <Link
                            href={`/products/${product.slug}`}
                            className="block text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1"
                          >
                            {product.name}
                          </Link>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                              {product.tagline || product.description}
                            </p>
                        </div>

                        {/* Quick Enquire button */}
                  <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 w-full py-1.5 px-2 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enquire Now</span>
                      </a>
                </div>
                </div>
              );
          })}
          </div>

          {/* Below 4 Products: Full Width "View All Products" Button (Mobile only) */}
          <div className="mt-8 sm:hidden">
            <Link
              href="/products"
              className="w-full py-3.5 px-6 rounded-xl bg-[#0b1a30] hover:bg-[#162a4a] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
            >
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 text-sky-400 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
      </div >
    </section >
  );
}

