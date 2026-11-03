import React from 'react';
import Link from 'next/link';
import { 
  Package, 
  Tags, 
  Award, 
  Inbox, 
  Plus, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  Sparkles,
  Phone,
  Film
} from 'lucide-react';
import { getProducts, getCategories, getBrands, getEnquiries } from '@/lib/store';

export const revalidate = 0; // Dynamic admin dashboard

export default async function AdminDashboardPage() {
  const [products, categories, brands, enquiries] = await Promise.all([
    getProducts(),
    getCategories(),
    getBrands(),
    getEnquiries(),
  ]);

  const pendingEnquiries = enquiries.filter(e => e.status === 'pending');
  const recentEnquiries = enquiries.slice(0, 5);

  const stats = [
    {
      label: 'Total Products',
      value: products.length,
      icon: Package,
      href: '/admin/products',
      color: 'text-sky-600 bg-sky-50 border-sky-200',
    },
    {
      label: 'Categories',
      value: categories.length,
      icon: Tags,
      href: '/admin/categories',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Partner Brands',
      value: brands.length,
      icon: Award,
      href: '/admin/brands',
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      label: 'Pending Enquiries',
      value: pendingEnquiries.length,
      icon: Inbox,
      href: '/admin/enquiries',
      color: 'text-rose-600 bg-rose-50 border-rose-200',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#0b1a30] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Elnix Powerzone CMS Dashboard
          </h1>
          <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
            Manage your hardware inventory, update wholesale and retail categories, review quote leads, and upload assets to Cloudinary.
          </p>

          <div className="pt-3 flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </Link>
            <Link
              href="/admin/hero"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-900/60 hover:bg-sky-900 text-sky-200 text-xs font-bold transition-all border border-sky-500/30"
            >
              <Film className="w-4 h-4 text-sky-400" />
              <span>Hero Video CMS</span>
            </Link>
            <Link
              href="/admin/enquiries"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20"
            >
              <Inbox className="w-4 h-4 text-sky-400" />
              <span>Review Leads ({pendingEnquiries.length} pending)</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.href}
              className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all group flex items-start justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  {s.label}
                </span>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  {s.value}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 group-hover:underline mt-2">
                  Manage &rarr;
                </span>
              </div>
              <div className={`p-3.5 rounded-2xl border ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 2 Columns: Recent Enquiries + Quick System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Enquiries & Quotes */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">Recent Customer Leads & Quotes</h2>
              <p className="text-xs text-slate-500">Live inquiries submitted through the website</p>
            </div>
            <Link
              href="/admin/enquiries"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnquiries.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No inquiries submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{enq.name}</span>
                      <span className="text-xs font-semibold text-slate-500">• {enq.phone}</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1 max-w-md">
                      <strong className="text-sky-700 font-semibold">{enq.category || 'General'}:</strong> {enq.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        enq.status === 'pending'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : enq.status === 'contacted'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {enq.status}
                    </span>
                    <a
                      href={`https://wa.me/91${enq.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System & Architecture Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-md space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Production Architecture
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Supabase Database</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                    Configured
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Schema located in <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">supabase/schema.sql</code>. Ready to run in SQL Editor.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Cloudinary Media CDN</span>
                  <span className="text-[10px] bg-sky-100 text-sky-700 font-bold px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Supports Drag & Drop + File Picker and Cloudinary destroy API for permanent deletion.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Tailwind CSS v4</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded">
                    v4.3.3
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Configured with @tailwindcss/postcss and modern CSS theme variables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

