'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, ArrowRight, Eye, Send, CheckCircle2, SlidersHorizontal, X } from 'lucide-react';
import { Product, Category, Brand } from '@/types';
import QuoteModal from '../QuoteModal';

interface ProductsClientProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  initialCategory?: string;
}

export default function ProductsClient({
  initialProducts,
  categories,
  brands,
  initialCategory = 'all',
}: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [selectedQuoteProduct, setSelectedQuoteProduct] = useState<Product | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Filter products
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory =
          product.category_id === selectedCategory ||
          product.category?.slug === selectedCategory ||
          product.category?.name?.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCategory) return false;
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        const matchesBrand =
          product.brand_id === selectedBrand ||
          product.brand?.slug === selectedBrand ||
          product.brand?.name?.toLowerCase() === selectedBrand.toLowerCase();
        if (!matchesBrand) return false;
      }

      // In stock
      if (onlyInStock && !product.in_stock) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          product.name.toLowerCase().includes(q) ||
          product.tagline?.toLowerCase().includes(q) ||
          product.description?.toLowerCase().includes(q) ||
          product.category?.name?.toLowerCase().includes(q) ||
          product.brand?.name?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [initialProducts, selectedCategory, selectedBrand, onlyInStock, searchQuery]);

  const handleOpenQuote = (product: Product) => {
    setSelectedQuoteProduct(product);
    setIsQuoteModalOpen(true);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSearchQuery('');
    setOnlyInStock(false);
  };

  const hasActiveFilters = selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery !== '' || onlyInStock;

  return (
    <div>
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md mb-10 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inverter batteries, cables, switches, pipes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all placeholder:text-slate-400 font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
            >
              <option value="all">All Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug || b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* In Stock toggle & Reset */}
          <div className="md:col-span-3 flex items-center justify-between gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
              />
              <span>In Stock Only</span>
            </label>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0b1a30] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Categories ({initialProducts.length})
          </button>
          {categories.map((cat) => {
            const isSelected =
              selectedCategory === cat.slug ||
              selectedCategory === cat.id ||
              selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{filteredProducts.length}</span> products
        </p>
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-4">
          <SlidersHorizontal className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No products match your criteria</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, category or brand filters to find what you are looking for.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-sky-500 transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id}
              className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
            >
              {/* Product Image */}
              <div className="relative aspect-4/3 w-full bg-slate-50 overflow-hidden border-b border-slate-100 flex items-center justify-center p-3">
                <img
                  src={prod.image_url}
                  alt={prod.name}
                  className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {prod.is_popular && (
                    <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                      Popular
                    </span>
                  )}
                  {prod.is_featured && (
                    <span className="px-2.5 py-1 bg-sky-600 text-white text-[10px] font-black uppercase tracking-wider rounded-md shadow-xs">
                      Featured
                    </span>
                  )}
                </div>

                {/* Stock status badge */}
                <div className="absolute top-3 right-3">
                  {prod.in_stock ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      In Stock
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                      On Order
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Category & Brand Tag */}
                  <div className="text-[11px] font-bold text-sky-600 uppercase tracking-wider mb-1">
                    {prod.category?.name || 'Hardware'} {prod.brand?.name ? `• ${prod.brand.name}` : ''}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/products/${prod.slug}`}
                    className="block text-base font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1"
                  >
                    {prod.name}
                  </Link>

                  {/* Tagline / Subtitle */}
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {prod.tagline || prod.description}
                  </p>
                </div>

                {/* Price / Quote Info & Actions */}
                <div className="pt-5 mt-auto border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    {prod.price ? (
                      <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase">Wholesale/Retail</div>
                        <div className="text-base font-black text-slate-900">
                          ₹{prod.price.toLocaleString('en-IN')}
                          {prod.unit && <span className="text-xs font-normal text-slate-500"> /{prod.unit}</span>}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                        Wholesale Rate
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/products/${prod.slug}`}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleOpenQuote(prod)}
                      className="px-3.5 py-2 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                      <span>Quote</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quote Modal */}
      {selectedQuoteProduct && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => {
            setIsQuoteModalOpen(false);
            setSelectedQuoteProduct(null);
          }}
          defaultProduct={selectedQuoteProduct.name}
          defaultCategory={selectedQuoteProduct.category?.name || 'Batteries'}
        />
      )}
    </div>
  );
}

