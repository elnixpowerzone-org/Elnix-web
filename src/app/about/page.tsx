import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BrandsSection from '@/components/home/BrandsSection';
import CtaBanner from '@/components/home/CtaBanner';
import { getBrands } from '@/lib/store';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  HeartHandshake, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Building2,
  PhoneCall
} from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | ELNIX POWERZONE',
  description: 'Learn about Elnix Powerzone, our heritage, commitment to genuine electrical, battery, plumbing and sanitary supplies in Kerala.',
};

export default async function AboutPage() {
  const brands = await getBrands();

  const values = [
    {
      title: '100% Genuine Guarantee',
      desc: 'Direct sourcing from certified manufacturers including Exide, Polycab, Finolex, and Jaquar ensures zero compromise on safety.',
      icon: ShieldCheck,
    },
    {
      title: 'Wholesale & Retail Versatility',
      desc: 'Whether you are a homeowner replacing a single switch or a developer procuring for a commercial complex, we deliver tiered competitive pricing.',
      icon: TrendingUp,
    },
    {
      title: 'Technical Advisory Support',
      desc: 'Our experienced staff helps you calculate inverter load capacities, choose correct wire gauges, and pick optimal plumbing fittings.',
      icon: Award,
    },
    {
      title: 'Long-term Customer Care',
      desc: 'Comprehensive warranty assistance, on-time delivery across Ernakulam district, and hassle-free replacements.',
      icon: HeartHandshake,
    },
  ];

  const milestones = [
    { year: 'Founded', label: 'Elnix Powerzone Established in Eruvely with battery & electrical distribution.' },
    { year: 'Expansion', label: 'Added comprehensive plumbing and premium sanitary showroom sections.' },
    { year: 'Partnerships', label: 'Authorized channel partnerships with 12+ national and international brands.' },
    { year: 'Today', label: 'Trusted supplier for over 5,000+ homes, villas, and commercial projects across Kerala.' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Page Banner */}
        <section className="bg-[#0b1a30] text-white py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
            <span className="text-xs font-black tracking-widest text-sky-400 uppercase block">
              OUR STORY & HERITAGE
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              About <span className="text-sky-400">Elnix Powerzone</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Your trusted partner for electrical, battery, plumbing, and sanitary supplies in Eruvely, Chottanikkara, Ernakulam.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                  COMMITTED TO EXCELLENCE
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  Powering Homes & Infrastructure Across Kerala
                </h2>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Established with a vision to streamline hardware and electrical procurement, <strong>Elnix Powerzone</strong> has evolved into a premier one-stop destination for homeowners, electrical contractors, plumbers, and builders.
                </p>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Located strategically at Elnix Tower in Eruvely, Chottanikkara, our modern showroom provides hands-on inspection of products from globally recognized brands like Exide, Bosch, Polycab, Finolex, and Jaquar.
                </p>

                <div className="pt-2 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-3xl font-black text-sky-600">5,000+</div>
                    <div className="text-xs font-bold text-slate-600 uppercase mt-1">Satisfied Clients</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-3xl font-black text-[#0b1a30]">1,200+</div>
                    <div className="text-xs font-bold text-slate-600 uppercase mt-1">Products in Stock</div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 bg-slate-900">
                  <img
                    src="/images/about-powerzone.jpg"
                    alt="Elnix Powerzone Quality Hardware & Power Systems Facility"
                    className="w-full h-[440px] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a30]/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Wholesale & Retail</span>
                    <h3 className="text-lg font-bold">Uncompromising Quality & Genuine Manufacturer Backing</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-slate-50 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                WHY CHOOSE ELNIX
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Our Four Core Commitments
              </h2>
              <p className="text-sm text-slate-500">
                Building relationships founded on trust, fair pricing, and dependable service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">
                        {v.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {v.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Milestone Timeline */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                GROWTH & EVOLUTION
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Our Journey
              </h2>
            </div>

            <div className="space-y-6">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-sky-300 transition-colors"
                >
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#0b1a30] text-white font-bold text-xs uppercase tracking-wider shrink-0 mt-0.5">
                    {m.year}
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Channel Partners Brands */}
        <BrandsSection brands={brands} />

        {/* CTA */}
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

