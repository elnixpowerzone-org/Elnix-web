'use client';

import React from 'react';
import { Phone, MessageCircle } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="relative bg-[#071326] text-white py-20 overflow-hidden">
      {/* Background Showroom Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=1600&q=80"
          alt="Elnix Powerzone Showroom Background"
          className="w-full h-full object-cover opacity-20 filter blur-xs"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071326] via-[#071326]/90 to-[#071326]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <span className="text-xs font-black tracking-widest text-sky-400 uppercase block">
          NEED PRODUCT INFORMATION?
        </span>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Get in Touch
        </h2>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Our team is ready to help you with product enquiries, pricing and availability. Visit our store or contact us today.
        </p>

        {/* Action Buttons matching the screenshot */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <a
            href="tel:8848318521"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm shadow-xl shadow-sky-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Phone className="w-4 h-4" />
            <span>Call Now 8848 318 521</span>
          </a>

          <a
            href="https://wa.me/918848318521?text=Hello%20Elnix%20Powerzone,%20I%20have%20an%20enquiry%20regarding%20products."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Us</span>
          </a>
        </div>
      </div>
    </section>
  );
}

