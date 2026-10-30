'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Facebook, 
  Instagram, 
  MessageCircle, 
  ChevronDown
} from 'lucide-react';

export default function Footer() {
  // Mobile accordion state (all collapsed initially)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    quickLinks: false,
    categories: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <footer className="bg-[#0b1a30] text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* DESKTOP LAYOUT (md and up) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-slate-800/80">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block group">
              <div className="bg-white px-4 py-2.5 rounded-2xl inline-flex items-center shadow-xs transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="ELNIX POWERZONE"
                  width={220}
                  height={64}
                  className="h-11 sm:h-12 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
              Wholesale and retail supplier of electrical, battery, plumbing and sanitary products in Eruvely, Chottanikkara, Ernakulam - Kerala.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/918848318521"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200"
                aria-label="Google Maps Location"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">Products</Link>
              </li>
              <li>
                <Link href="/locations" className="hover:text-white transition-colors">Our Locations</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Product Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Product Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/products?category=batteries" className="hover:text-white transition-colors">Batteries</Link>
              </li>
              <li>
                <Link href="/products?category=electricals" className="hover:text-white transition-colors">Electricals</Link>
              </li>
              <li>
                <Link href="/products?category=plumbing" className="hover:text-white transition-colors">Plumbing</Link>
              </li>
              <li>
                <Link href="/products?category=sanitary" className="hover:text-white transition-colors">Sanitary</Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Contact Information
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="tel:8848318521" className="hover:text-white font-semibold">
                  8848 318 521
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                <a href="mailto:elnixpowerzone@gmail.com" className="hover:text-white truncate">
                  elnixpowerzone@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed text-[11px]">
                  <div>Mon - Sat: 9:00 AM - 8:00 PM</div>
                  <div>Sunday: 9:00 AM - 4:00 PM</div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* MOBILE ACCORDION LAYOUT (hidden on md and up) */}
        <div className="md:hidden pb-8 border-b border-slate-800/80 space-y-5">
          {/* Brand & Socials */}
          <div className="space-y-3 pb-2 text-center">
            <Link href="/" className="inline-block">
              <div className="bg-white px-4 py-2.5 rounded-2xl inline-flex items-center shadow-xs">
                <Image
                  src="/logo.png"
                  alt="ELNIX POWERZONE"
                  width={200}
                  height={58}
                  className="h-10 sm:h-11 w-auto object-contain"
                />
              </div>
            </Link>

            <p className="text-xs text-slate-300 leading-relaxed max-w-xs mx-auto">
              Wholesale & retail supplier of electrical, battery, plumbing and sanitary products in Eruvely, Chottanikkara.
            </p>

            <div className="flex items-center justify-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-sky-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/918848318521"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                aria-label="Google Maps Location"
              >
                <MapPin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Accordion 1: Quick Links */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('quickLinks')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-white hover:bg-slate-800/50 transition-colors"
            >
              <span>Quick Links</span>
              <ChevronDown
                className={`w-4 h-4 text-sky-400 transition-transform duration-300 ${
                  openSections.quickLinks ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.quickLinks && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-200">
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li><Link href="/" className="hover:text-white block py-0.5">Home</Link></li>
                  <li><Link href="/about" className="hover:text-white block py-0.5">About Us</Link></li>
                  <li><Link href="/products" className="hover:text-white block py-0.5">Products</Link></li>
                  <li><Link href="/locations" className="hover:text-white block py-0.5">Our Locations</Link></li>
                  <li><Link href="/contact" className="hover:text-white block py-0.5">Contact</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 2: Product Categories */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('categories')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-white hover:bg-slate-800/50 transition-colors"
            >
              <span>Product Categories</span>
              <ChevronDown
                className={`w-4 h-4 text-sky-400 transition-transform duration-300 ${
                  openSections.categories ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.categories && (
              <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-200">
                <ul className="space-y-2.5 text-xs text-slate-300">
                  <li><Link href="/products?category=batteries" className="hover:text-white block py-0.5">Batteries</Link></li>
                  <li><Link href="/products?category=electricals" className="hover:text-white block py-0.5">Electricals</Link></li>
                  <li><Link href="/products?category=plumbing" className="hover:text-white block py-0.5">Plumbing</Link></li>
                  <li><Link href="/products?category=sanitary" className="hover:text-white block py-0.5">Sanitary</Link></li>
                </ul>
              </div>
            )}
          </div>

          {/* Accordion 3: Contact Information */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden">
            <button
              onClick={() => toggleSection('contact')}
              className="w-full flex items-center justify-between p-4 text-left font-bold text-sm text-white hover:bg-slate-800/50 transition-colors"
            >
              <span>Contact Information</span>
              <ChevronDown
                className={`w-4 h-4 text-sky-400 transition-transform duration-300 ${
                  openSections.contact ? 'rotate-180' : ''
                }`}
              />
            </button>
            {openSections.contact && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 animate-in slide-in-from-top-2 duration-200 space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <a href="tel:8848318521" className="hover:text-white font-semibold">
                    8848 318 521
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <a href="mailto:elnixpowerzone@gmail.com" className="hover:text-white">
                    elnixpowerzone@gmail.com
                  </a>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed text-[11px]">
                    <div>Mon - Sat: 9:00 AM - 8:00 PM</div>
                    <div>Sunday: 9:00 AM - 4:00 PM</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & CRAFTED BY EKODRIX (CENTERED) */}
        <div className="pt-8 flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-1.5">
          <p>© 2026 Elnix Powerzone. All rights reserved.</p>
          <p className="text-slate-400 flex items-center justify-center gap-1">
            <span>Crafted by</span>
            <a
              href="https://www.ekodrix.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-slate-200 font-semibold underline underline-offset-2 transition-colors"
            >
              ekodrix
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
