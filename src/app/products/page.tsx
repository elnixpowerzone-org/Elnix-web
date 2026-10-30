import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductsClient from '@/components/products/ProductsClient';
import CtaBanner from '@/components/home/CtaBanner';
import { getCategories, getProducts, getBrands } from '@/lib/store';

export const metadata = {
  title: 'Product Catalog | ELNIX POWERZONE',
  description: 'Explore batteries, electricals, plumbing, and sanitary supplies from leading brands at Elnix Powerzone.',
};

export const revalidate = 30;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products, brands] = await Promise.all([
    getCategories(),
    getProducts(),
    getBrands(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-slate-50/50">
        {/* Header */}
        <section className="bg-[#0b1a30] text-white py-14 lg:py-20 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3 relative z-10">
            <span className="text-xs font-black tracking-widest text-sky-400 uppercase block">
              COMPREHENSIVE CATALOGUE
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight">
              Our Products & Supplies
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Explore trusted national & international brands for home electrification, batteries, plumbing setups, and designer sanitaryware.
            </p>
          </div>
        </section>

        {/* Catalog Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ProductsClient
            initialProducts={products}
            categories={categories}
            brands={brands}
            initialCategory={category || 'all'}
          />
        </div>

        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

