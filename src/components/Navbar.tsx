'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Phone, ArrowRight, Menu, X, MessageCircle } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const enquiryWhatsappUrl = `https://wa.me/918848318521?text=${encodeURIComponent(
    'Hello Elnix Powerzone, I have an enquiry about your products. Could you please share the pricing, catalog, and availability details?'
  )}`;

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Products', href: '/products' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Prevent background scrolling when full-screen mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-200/95 backdrop-blur-md border-b border-slate-300 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center group py-1">
              <Image
                src="/logo.png"
                alt="ELNIX POWERZONE"
                width={200}
                height={58}
                className="h-6.5 sm:h-8 md:h-9 lg:h-10 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      active
                        ? 'text-sky-600 bg-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right CTAs (Desktop): Phone + Enquiry */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Phone CTA */}
              <a
                href="tel:8848318521"
                className="flex items-center gap-3 text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-white text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                    8848 318 521
                  </div>
                  <div className="text-[11px] font-medium text-slate-500">
                    Call or WhatsApp
                  </div>
                </div>
              </a>

              {/* Enquiry Button */}
              <a
                href={enquiryWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1a30] hover:bg-[#162a4a] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
              >
                <span>Enquiry</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </a>
            </div>

            {/* Mobile Header Buttons */}
            <div className="flex md:hidden items-center gap-2.5">
              <a
                href={enquiryWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-[#0b1a30] text-white text-xs font-bold rounded-lg cursor-pointer"
              >
                Enquiry
              </a>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 text-slate-800 hover:text-slate-950 focus:outline-none cursor-pointer"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* FULL-HEIGHT MOBILE MENU MODAL */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-white h-[100dvh] w-full flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
            {/* Top Bar with Brand Logo and Close Button */}
            <div className="h-20 px-6 border-b border-slate-300 bg-slate-200 flex items-center justify-between shrink-0">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center py-1"
              >
                <Image
                  src="/logo.png"
                  alt="ELNIX POWERZONE"
                  width={180}
                  height={52}
                  className="h-6.5 sm:h-7.5 w-auto object-contain"
                  priority
                />
              </Link>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2.5 text-slate-700 hover:text-slate-950 rounded-xl hover:bg-slate-300/80 transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav Links starting right below the top header */}
            <div className="px-5 pt-3 pb-6 flex-1 flex flex-col justify-start space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
                      active
                        ? 'bg-sky-50 text-sky-600 shadow-2xs font-black'
                        : 'text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight className={`w-4 h-4 ${active ? 'text-sky-600' : 'text-slate-300'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Bottom Actions: Contact Info + Get a Quote & WhatsApp */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/70 shrink-0 space-y-3.5">
              {/* Phone Info */}
              <a
                href="tel:8848318521"
                className="flex items-center gap-3 px-2 py-1 text-slate-800"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">8848 318 521</div>
                  <div className="text-xs text-slate-500">Call or WhatsApp us directly</div>
                </div>
              </a>

              {/* Action Buttons: Enquiry & WhatsApp (Direct WhatsApp triggers) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <a
                  href={enquiryWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-[#0b1a30] hover:bg-[#162a4a] text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <span>Enquiry</span>
                  <ArrowRight className="w-4 h-4 text-sky-400" />
                </a>

                <a
                  href={enquiryWhatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
