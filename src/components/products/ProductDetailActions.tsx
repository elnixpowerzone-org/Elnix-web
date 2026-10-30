'use client';

import React, { useState } from 'react';
import { Send, Phone, MessageCircle } from 'lucide-react';
import { Product } from '@/types';
import QuoteModal from '../QuoteModal';

export default function ProductDetailActions({ product }: { product: Product }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  const whatsappMessage = encodeURIComponent(
    `Hello Elnix Powerzone, I am interested in inquiring about "${product.name}" (Slug: ${product.slug}). Could you share wholesale/retail price and availability?`
  );

  return (
    <>
      <div className="pt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setIsQuoteOpen(true)}
          className="flex-1 min-w-[200px] py-3.5 px-6 rounded-xl bg-[#0b1a30] hover:bg-[#162a4a] text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Send className="w-4 h-4 text-sky-400" />
          <span>Request Wholesale Quote</span>
        </button>

        <a
          href={`https://wa.me/918848318521?text=${whatsappMessage}`}
          target="_blank"
          rel="noreferrer"
          className="py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp Enquiry</span>
        </a>

        <a
          href="tel:8848318521"
          className="py-3.5 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
        >
          <Phone className="w-4 h-4 text-sky-600" />
          <span>8848 318 521</span>
        </a>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        defaultProduct={product.name}
        defaultCategory={product.category?.name || 'Batteries'}
      />
    </>
  );
}

