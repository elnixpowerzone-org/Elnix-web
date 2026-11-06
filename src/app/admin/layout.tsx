'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Film,
  Package, 
  Tags, 
  Award, 
  Inbox, 
  MapPin, 
  Settings, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Menu, 
  X,
  Database,
  CloudLightning
} from 'lucide-react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, isLoading, logout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // If on login page, render children directly without admin layout chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Guard: If loading, show sleek splash
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#071326] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-slate-300">Verifying Admin Access...</p>
        </div>
      </div>
    );
  }

  // Guard: If not admin, redirect to login via useEffect to prevent router setState during render
  React.useEffect(() => {
    if (!isLoading && !isAdmin && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, pathname, router]);

  if (!isAdmin) {
    return null;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Hero Section', href: '/admin/hero', icon: Film },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Tags },
    { label: 'Brands', href: '/admin/brands', icon: Award },
    { label: 'Customer Enquiries', href: '/admin/enquiries', icon: Inbox },
    { label: 'Store Locations', href: '/admin/locations', icon: MapPin },
    { label: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  const isCurrent = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0b1a30] text-slate-300 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Area */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link href="/" className="block group">
              <div className="bg-white px-3.5 py-2 rounded-xl inline-flex items-center shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ELNIX POWERZONE"
                  width={180}
                  height={53}
                  className="h-9 sm:h-10 w-auto object-contain"
                />
              </div>
              <div className="flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-sky-400 uppercase tracking-widest">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin CMS Panel</span>
              </div>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
              Management
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isCurrent(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    active
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <div className="text-xs font-bold text-white truncate">
              {user?.full_name || 'Administrator'}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {user?.email}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Role: Admin
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="py-2 px-3 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-bold flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-2xs h-16 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold text-slate-800 hidden sm:block">
              Elnix Powerzone Content Management System
            </div>
          </div>

          {/* Quick status chips */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              <Database className="w-3.5 h-3.5" />
              <span>Supabase Ready</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
              <CloudLightning className="w-3.5 h-3.5" />
              <span>Cloudinary CDN</span>
            </div>
            <Link
              href="/products"
              target="_blank"
              className="px-3 py-1.5 rounded-lg bg-[#0b1a30] text-white font-bold text-xs hover:bg-sky-600 transition-colors flex items-center gap-1"
            >
              <span>Storefront</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}

