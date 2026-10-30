import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Privacy Policy | ELNIX POWERZONE',
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="border-b border-slate-200 pb-6">
            <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">Legal Document</span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-sm text-slate-500 mt-2">Last updated: October 2026 • Elnix Powerzone</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-6 text-sm text-slate-700 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">1. Information We Collect</h2>
              <p>
                When you contact Elnix Powerzone, request quotations, or place wholesale/retail orders, we collect personal information such as your name, contact phone number, email address, delivery location, and specific product interests.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
              <p>
                Your data is exclusively utilized to process your enquiries, generate competitive quotation price lists, coordinate transport delivery of materials, provide warranty assistance, and answer your inquiries.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">3. Protection of Customer Data</h2>
              <p>
                We do not sell, rent, or trade your contact information to third parties. Information is strictly maintained on secure database servers (Supabase) protected by strict Row-Level Security policies.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">4. Contact Us</h2>
              <p>
                For questions regarding your privacy, contact us at <strong>elnixpowerzone@gmail.com</strong> or visit our showroom at Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

