import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/contact/ContactForm';
import LocationCard from '@/components/contact/LocationCard';
import { getSiteSettings, getStoreLocations } from '@/lib/store';
import { 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Sparkles,
  MapPin,
  ShieldCheck,
  Truck,
  Layers
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return {
    title: `Contact Us | ${settings.store_name || 'ELNIX POWERZONE'} Showrooms & Wholesale Support`,
    description: settings.contact_description || 
      'Get in touch with ELNIX POWERZONE for electrical, battery, plumbing, and sanitary quotations or visit our showroom locations in Kerala.',
  };
}

export default async function ContactPage() {
  const [settings, locations] = await Promise.all([
    getSiteSettings(),
    getStoreLocations({ onlyVisible: true }),
  ]);

  const rawPhone = settings.phone || '8848 318 521';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const rawWhatsApp = settings.whatsapp || '918848318521';
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hello Elnix Powerzone, I would like to make an inquiry regarding your products and pricing.'
  )}`;

  const compactFaqs = [
    {
      icon: Layers,
      title: 'Contractor & Bulk Rates',
      desc: 'Tiered wholesale pricing for electricians, plumbers, builders, and commercial project managers across Kerala.',
    },
    {
      icon: ShieldCheck,
      title: '100% OEM Warranties',
      desc: 'Direct OEM supplies for Exide, Amaron, Polycab, Finolex, and Jaquar with manufacturer authorized warranty cards.',
    },
    {
      icon: Truck,
      title: 'Kerala-wide Delivery',
      desc: 'Prompt on-site transport delivery throughout Ernakulam and nearby Kerala districts for bulk orders and heavy cables.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Navbar />
      <main className="flex-1 pb-16 sm:pb-20">
        {/* 1. COMPACT CONTACT HERO */}
        <section className="bg-[#0b1a30] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
          {/* Subtle Ambient Lighting */}
          <div className="absolute inset-0 bg-radial from-sky-950/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
            {/* Small Eyebrow Label */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[11px] font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{settings.contact_eyebrow || 'GET IN TOUCH'}</span>
            </div>

            {/* Heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {settings.contact_heading || "Let's Connect"}
            </h1>

            {/* Short Supporting Text */}
            <p className="text-slate-300 max-w-2xl mx-auto text-xs sm:text-sm sm:leading-relaxed">
              {settings.contact_description ||
                'Whether you are a homeowner, electrical contractor, plumber, builder, or project buyer — our specialists are ready to assist with genuine supplies, competitive quotations, and prompt Kerala-wide dispatch.'}
            </p>

            {/* Primary & Secondary Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {/* Primary CTA: Call Now */}
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-sky-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[42px]"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now: {rawPhone}</span>
              </a>

              {/* Secondary CTA: WhatsApp Us */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer min-h-[42px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. COMPACT CONTACT INFORMATION STRIP */}
        <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:divide-x lg:divide-slate-100">
              {/* Phone */}
              <div className="flex items-center gap-3.5 p-2 sm:p-2.5 lg:first:pl-2">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="text-sm font-bold text-slate-900 hover:text-sky-600 transition-colors truncate block"
                    title={`Call ${rawPhone}`}
                  >
                    {rawPhone}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-3.5 p-2 sm:p-2.5 lg:pl-5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    WhatsApp Chat
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors truncate block"
                    title="Open WhatsApp chat"
                  >
                    +{cleanWhatsApp}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-3.5 p-2 sm:p-2.5 lg:pl-5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${settings.email || 'elnixpowerzone@gmail.com'}`}
                    className="text-xs font-bold text-slate-900 hover:text-sky-600 transition-colors truncate block"
                    title={settings.email || 'elnixpowerzone@gmail.com'}
                  >
                    {settings.email || 'elnixpowerzone@gmail.com'}
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-center gap-3.5 p-2 sm:p-2.5 lg:pl-5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Business Hours
                  </span>
                  <span 
                    className="text-xs font-semibold text-slate-800 block truncate"
                    title={settings.timings || 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 9:00 AM - 4:00 PM'}
                  >
                    {settings.timings || 'Mon - Sat: 9AM - 8PM | Sun: 9AM - 4PM'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. LOCATIONS & SHOWROOMS — 2-COLUMN DESKTOP GRID / 1-COLUMN MOBILE */}
        <section id="locations" className="py-12 sm:py-16 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Compact Header */}
            <div className="text-center mb-8 sm:mb-10 space-y-1.5">
              <span className="text-[11px] font-black tracking-widest text-sky-600 uppercase block">
                SHOWROOMS & HUBS
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Our Showroom Locations
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
                Visit our physical showrooms for live product demos, automated battery testing benches, and wholesale counter support.
              </p>
            </div>

            {/* Responsive 2-Column Desktop Grid / 1-Column Mobile Layout */}
            {locations.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 max-w-2xl mx-auto">
                <MapPin className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">Store location details are being updated.</p>
                <p className="text-[11px] text-slate-400 mt-1">Please call or WhatsApp our main helpline for showroom directions.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                {locations.map((loc) => (
                  <LocationCard key={loc.id} location={loc} layout="horizontal" />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. SIMPLIFIED ENQUIRY FORM */}
        <section className="py-12 sm:py-16 bg-slate-100/60 border-t border-slate-200/80">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContactForm locations={locations} />

            {/* 5. COMPACT FAQ CARDS */}
            <div className="mt-12 sm:mt-16 pt-10 border-t border-slate-200">
              <div className="text-center mb-6">
                <span className="text-[10px] font-black tracking-widest text-sky-600 uppercase block">
                  FREQUENTLY ASKED QUESTIONS
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1">
                  Quick Answers for Trade & Project Buyers
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {compactFaqs.map((faq, idx) => {
                  const Icon = faq.icon;
                  return (
                    <div 
                      key={idx}
                      className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow space-y-2"
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {faq.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {faq.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
