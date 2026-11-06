import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactForm from '@/components/contact/ContactForm';
import LocationCard from '@/components/contact/LocationCard';
import { getSiteSettings, getStoreLocations } from '@/lib/store';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  HelpCircle, 
  ShieldCheck, 
  Truck, 
  ArrowRight,
  Headphones,
  CheckCircle2,
  Sparkles
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

  const cleanPhone = (settings.phone || '8848 318 521').replace(/[^0-9]/g, '');
  const cleanWhatsApp = (settings.whatsapp || '918848318521').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    'Hello Elnix Powerzone, I would like to make an inquiry regarding your products and pricing.'
  )}`;

  const faqs = [
    {
      q: 'Do you offer special pricing for contractors and bulk buyers?',
      a: 'Yes, we provide tiered wholesale pricing for electrical contractors, plumbers, builders, and large commercial projects across Kerala. Reach out via our quote form or visit our showroom.',
    },
    {
      q: 'Are the products covered by official manufacturer warranties?',
      a: '100% yes. All batteries (Exide, Amaron, SF Sonic, Bosch, Luminous), wiring (Polycab, Finolex, RR Kabel), and sanitaryware (Jaquar, Cera) are direct OEM supplies with authorized manufacturer warranty cards.',
    },
    {
      q: 'Do you provide delivery for heavy materials like batteries and pipe bundles?',
      a: 'Yes, we arrange prompt on-site transport delivery throughout Ernakulam and nearby Kerala districts for contractor bulk orders.',
    },
    {
      q: 'Can I test my old inverter or car battery at your showroom?',
      a: 'Yes! We have an automated electronic testing bench at our Eruvely showroom to measure load, specific gravity, and cranking performance free of charge.',
    },
  ];

  const wholesaleHighlights = [
    {
      icon: ShieldCheck,
      title: '100% Authentic OEM Supplies',
      desc: 'Direct channel distributor for Exide, Amaron, Polycab, Finolex, and Jaquar.',
    },
    {
      icon: Truck,
      title: 'Direct Site Transport',
      desc: 'Rapid loading and logistics for pipes, cables, and inverter batteries across Kerala.',
    },
    {
      icon: Headphones,
      title: 'Dedicated Project Engineers',
      desc: 'Estimation and Bill-of-Materials support for residential complexes and villas.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800 antialiased">
      <Navbar />
      <main className="flex-1">
        {/* A. CONTACT HERO */}
        <section className="bg-[#0b1a30] text-white py-16 lg:py-20 relative overflow-hidden border-b border-slate-800">
          {/* Subtle Ambient Background Gradient */}
          <div className="absolute inset-0 bg-radial from-sky-950/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-black tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{settings.contact_eyebrow || 'GET IN TOUCH'}</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
              {settings.contact_heading || "We're Here to Help"}
            </h1>

            {/* Welcoming Description */}
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              {settings.contact_description ||
                'Connect with our wholesale specialists for genuine electricals, inverters, plumbing lines, and sanitaryware. Visit our showroom, call directly, or request a customized project quote.'}
            </p>

            {/* Hero Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Call Now Button */}
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now: {settings.phone || '8848 318 521'}</span>
              </a>

              {/* WhatsApp Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Us</span>
              </a>

              {/* Request a Quote CTA Button */}
              <a
                href="#enquiry-form"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-white/20 text-white font-bold text-sm tracking-wide backdrop-blur-xs transition-all hover:border-white/40 cursor-pointer"
              >
                <span>Request a Quote</span>
                <ArrowRight className="w-4 h-4 text-sky-400" />
              </a>
            </div>
          </div>
        </section>

        {/* B. CONTACT INFORMATION CARDS */}
        <section className="py-12 lg:py-16 -mt-6 sm:-mt-8 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Phone Card */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Direct Phone
                    </span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-lg font-black text-slate-900 hover:text-sky-600 transition-colors block mt-0.5"
                    >
                      {settings.phone || '8848 318 521'}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                  Instant response during working hours
                </p>
              </div>

              {/* WhatsApp Card */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      WhatsApp Quick Chat
                    </span>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-black text-emerald-600 hover:text-emerald-700 transition-colors block mt-0.5 truncate"
                    >
                      +{cleanWhatsApp}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                  Share product photos & BOM lists
                </p>
              </div>

              {/* Email Card */}
              <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                      Email Inquiries
                    </span>
                    <a
                      href={`mailto:${settings.email || 'elnixpowerzone@gmail.com'}`}
                      className="text-sm font-black text-slate-900 hover:text-sky-600 transition-colors block mt-1 truncate"
                      title={settings.email || 'elnixpowerzone@gmail.com'}
                    >
                      {settings.email || 'elnixpowerzone@gmail.com'}
                    </a>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100 truncate">
                  Quotes, tenders & purchase orders
                </p>
              </div>

              {/* Working Hours Card */}
              <div className="p-6 bg-[#0b1a30] text-white rounded-3xl shadow-md flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-sky-400 flex items-center justify-center">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-sky-300 block">
                      Store Hours
                    </span>
                    <div className="text-xs font-semibold text-slate-200 mt-1 whitespace-pre-line leading-relaxed">
                      {settings.timings || 'Mon - Sat: 9:00 AM - 8:00 PM\nSunday: 9:00 AM - 4:00 PM'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-bold mt-4 pt-3 border-t border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Open 7 Days a Week</span>
                </div>
              </div>
            </div>

            {/* Optional General Enquiry Banner if configured */}
            {settings.contact_enquiry_info && (
              <div className="mt-5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3 text-xs sm:text-sm text-slate-600">
                <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-medium">{settings.contact_enquiry_info}</span>
              </div>
            )}
          </div>
        </section>

        {/* C. MULTIPLE STORE / OFFICE LOCATIONS */}
        <section id="locations" className="py-14 sm:py-20 bg-white border-y border-slate-200/70 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Locations Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                OUR LOCATIONS & SHOWROOMS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Visit Our Stores Across Kerala
              </h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
                Explore our full product lines in person at our dedicated showrooms. Each location features live demonstration displays, computerized battery testing benches, and wholesale counter support.
              </p>
            </div>

            {/* Locations Multi-Column Layout */}
            {locations.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 text-slate-500">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-semibold">Store location details are being updated.</p>
                <p className="text-xs text-slate-400 mt-1">Please call or WhatsApp our main line for assistance.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {locations.map((loc) => (
                  <LocationCard key={loc.id} location={loc} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* D. CONTACT ENQUIRY FORM & CUSTOMER PERKS */}
        <section className="py-16 sm:py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Left Column: Why Choose Elnix & Common FAQs */}
              <div className="lg:col-span-5 space-y-8">
                {/* Wholesale Perks Card */}
                <div className="bg-[#0b1a30] text-white p-7 sm:p-8 rounded-3xl shadow-xl space-y-6">
                  <div>
                    <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase block">
                      WHOLESALE & RETAIL EXCELLENCE
                    </span>
                    <h3 className="text-2xl font-black tracking-tight mt-1">
                      Partner with Elnix Powerzone
                    </h3>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      We supply home builders, electricians, plumbing contractors, and institutions with authorized brand products at competitive trade rates.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {wholesaleHighlights.map((perk, i) => {
                      const Icon = perk.icon;
                      return (
                        <div key={i} className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white/10 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white leading-snug">{perk.title}</h4>
                            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{perk.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Direct Contact Pill */}
                  <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Need immediate dispatch?</span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="text-sky-400 hover:text-sky-300 font-bold inline-flex items-center gap-1"
                    >
                      <span>Call {settings.phone || '8848 318 521'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* FAQs Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-5">
                  <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
                    <HelpCircle className="w-4 h-4" />
                    <span>Frequently Asked Questions</span>
                  </div>

                  <div className="space-y-4">
                    {faqs.map((f, i) => (
                      <div key={i} className="border-b border-slate-100 pb-3.5 last:border-0 last:pb-0">
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">
                          {f.q}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {f.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Complete Enquiry Form */}
              <div className="lg:col-span-7">
                <ContactForm locations={locations} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
