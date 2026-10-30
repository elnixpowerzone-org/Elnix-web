import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Terms of Service | ELNIX POWERZONE',
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Terms & Conditions</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Terms of Service</h1>
            <p className="text-sm text-slate-500 mt-2">Effective: October 2026 • Elnix Powerzone, Kerala</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">1. Quotations and Wholesale Pricing</h2>
              <p>
                All wholesale quotations provided through this website or directly via WhatsApp are subject to confirmation of quantity, brand availability, and applicable GST at the time of purchase.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">2. Manufacturer Warranties</h2>
              <p>
                Products distributed by Elnix Powerzone carry authentic warranty commitments from respective manufacturers (including Exide Industries, Bosch, Polycab, Finolex, Jaquar, and Cera). Warranty terms, replacement schedules, and service centers are governed by manufacturer guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">3. Delivery & Transportation</h2>
              <p>
                On-site delivery for heavy materials (tubular batteries, cables, pipes) is scheduled upon confirmation of the order. Offloading conditions at customer site must be accessible for transport trucks.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">4. Contact & Inquiries</h2>
              <p>
                For official commercial terms, reach us at <strong>elnixpowerzone@gmail.com</strong> or call <strong>8848 318 521</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

