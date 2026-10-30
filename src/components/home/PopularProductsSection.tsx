'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Eye, Send } from 'lucide-react';
import { Product } from '@/types';
import QuoteModal from '../QuoteModal';

interface PopularProductsSectionProps {
  products: Product[];
}

export default function PopularProductsSection({ products }: PopularProductsSectionProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // Filter to show popular products (or first 6)
  const popularList = products.filter(p => p.is_popular).slice(0, 6);

  const handleRequestQuote = (prod: Product) => {
    setSelectedProduct(prod);
    setIsQuoteOpen(true);
  };

  return (
    <>
      <section className="py-20 bg-slate-50 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                FEATURED PRODUCTS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Popular Products
              </h2>
              <p className="text-sm sm:text-base text-slate-500 max-w-xl">
                A selection of our fine product categories from leading brands.
              </p>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1a30] hover:bg-[#162a4a] text-white text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
            </Link>
          </div>

          {/* 6 Products Grid matching exact design layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
            {popularList.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-slate-200/80 p-4 flex flex-col justify-between hover:shadow-xl hover:border-sky-300 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Product Image Container */}
                <div className="relative aspect-square w-full rounded-xl bg-slate-50 overflow-hidden flex items-center justify-center p-2 mb-3 border border-slate-100">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain transform transition-transform duration-300 group-hover:scale-108"
                  />
                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-[#0b1a30]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-2xs">
                    <button
                      type="button"
                      onClick={() => handleRequestQuote(product)}
                      title="Enquire / Get Quote"
                      className="p-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white transition-transform active:scale-90"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      title="View Details"
                      className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-900 transition-transform active:scale-90"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Details */}
                <div className="text-center space-y-1">
                  <Link
                    href={`/products/${product.slug}`}
                    className="block text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1"
                  >
                    {product.name}
                  </Link>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                    {product.tagline || product.description}
                  </p>
                </div>

                {/* Quick Enquire button */}
                <button
                  type="button"
                  onClick={() => handleRequestQuote(product)}
                  className="mt-3 w-full py-1.5 px-2 bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-600 border border-slate-200 hover:border-sky-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Enquire Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Modal */}
      {selectedProduct && (
        <QuoteModal
          isOpen={isQuoteOpen}
          onClose={() => {
            setIsQuoteOpen(false);
            setSelectedProduct(null);
          }}
          defaultProduct={selectedProduct.name}
          defaultCategory={selectedProduct.category?.name || 'Batteries'}
        />
      )}
    </>
  );
}

