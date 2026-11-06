import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CtaBanner from '@/components/home/CtaBanner';
import { getProductBySlug, getProducts } from '@/lib/store';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Truck, 
  Clock, 
  MapPin, 
  Send,
  Layers
} from 'lucide-react';
import ProductDetailActions from '@/components/products/ProductDetailActions';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Product Not Found | ELNIX POWERZONE' };
  }
  return {
    title: `${product.name} | ELNIX POWERZONE`,
    description: product.description || product.tagline,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getProducts({ category: product.category_id }))
    .filter(p => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb & Back */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-8">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-slate-900 transition-colors">
              Products
            </Link>
            <span>/</span>
            <Link
              href={`/products?category=${product.category?.slug || ''}`}
              className="hover:text-slate-900 transition-colors"
            >
              {product.category?.name || 'Category'}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
          </div>

          {/* Main Product Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-10 mb-14">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              {/* Product Image Gallery Column */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200/80 overflow-hidden shadow-xs">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Additional gallery thumbs if any */}
                {product.gallery && product.gallery.length > 0 && (
                  <div className="flex items-center gap-3 overflow-x-auto pb-1">
                    <div className="w-16 h-16 rounded-xl border-2 border-sky-500 p-1 bg-white shrink-0">
                      <img src={product.image_url} alt="Main" className="w-full h-full object-cover rounded-lg" />
                    </div>
                    {product.gallery.map((img, i) => (
                      <div key={i} className="w-16 h-16 rounded-xl border border-slate-200 p-1 bg-white shrink-0">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Trust Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">100% Genuine</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-sky-600 shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">Kerala Delivery</span>
                  </div>
                </div>
              </div>

              {/* Product Details Column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Brand & Stock */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider border border-sky-100">
                      {product.category?.name || 'Category'}
                    </span>
                    {product.brand && (
                      <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider">
                        Brand: {product.brand.name}
                      </span>
                    )}
                  </div>

                  {product.in_stock ? (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Available in Stock
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                      Available on Order
                    </span>
                  )}
                </div>

                {/* Product Name & Tagline */}
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {product.name}
                  </h1>
                  {product.tagline && (
                    <p className="text-sm sm:text-base font-semibold text-sky-600 mt-1">
                      {product.tagline}
                    </p>
                  )}
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-slate-500 uppercase tracking-wider block font-bold">
                      Pricing Mode
                    </span>
                    {product.price ? (
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
                        ₹{product.price.toLocaleString('en-IN')}{' '}
                        {product.unit && (
                          <span className="text-xs font-normal text-slate-500">/{product.unit}</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-slate-800">
                        Wholesale & Retail Quotation
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    *Special volume discounts for contractors
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Description & Applications
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Specifications Table */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Technical Specifications
                    </h3>
                    <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-200 text-xs">
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} className="grid grid-cols-3 p-3 bg-white hover:bg-slate-50 transition-colors">
                          <span className="font-bold text-slate-700">{key}</span>
                          <span className="col-span-2 text-slate-600">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <ProductDetailActions product={product} />
              </div>
            </div>
          </div>

          {/* Related Products from same category */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    More in {product.category?.name || 'this category'}
                  </h2>
                </div>
                <Link
                  href={`/products?category=${product.category?.slug || ''}`}
                  className="text-xs font-bold text-sky-600 hover:text-sky-700"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((rel) => (
                  <Link
                    key={rel.id}
                    href={`/products/${rel.slug}`}
                    className="bg-white rounded-2xl border border-slate-200/80 hover:shadow-md hover:border-sky-300 transition-all group flex flex-col justify-between overflow-hidden"
                  >
                    <div className="aspect-square w-full bg-slate-100 overflow-hidden shrink-0">
                      <img
                        src={rel.image_url}
                        alt={rel.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-3.5 sm:p-4">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                        {rel.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {rel.tagline || rel.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-16">
          <CtaBanner />
        </div>
      </main>
      <Footer />
    </div>
  );
}

