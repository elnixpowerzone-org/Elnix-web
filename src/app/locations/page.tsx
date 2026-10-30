import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LocationSection from '@/components/home/LocationSection';
import CtaBanner from '@/components/home/CtaBanner';
import { 
  MapPin, 
  Car, 
  Truck, 
  Sparkles, 
  Clock, 
  Phone, 
  Mail, 
  Navigation, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

export const metadata = {
  title: 'Our Locations | ELNIX POWERZONE Showroom',
  description: 'Visit the Elnix Powerzone showroom at Elnix Tower, Eruvely, Chottanikkara, Ernakulam. Hardware, battery, electrical, plumbing & sanitary supplies.',
};

export default function LocationsPage() {
  const amenities = [
    {
      title: 'Spacious Customer Parking',
      desc: 'Free, dedicated parking right in front of Elnix Tower for cars and transport vehicles.',
      icon: Car,
    },
    {
      title: 'Wholesale Loading Dock',
      desc: 'Quick vehicle loading support for contractor bulk orders and heavy cables/batteries.',
      icon: Truck,
    },
    {
      title: 'Live Product Demonstrations',
      desc: 'Interactive display setups of modular switches, faucets, inverters, and bathroom sanitaryware.',
      icon: Sparkles,
    },
    {
      title: 'Battery Health Testing',
      desc: 'Complimentary high-discharge test bench for automotive and tubular inverter batteries.',
      icon: ShieldCheck,
    },
  ];

  const travelGuides = [
    {
      from: 'From Thripunithura Statue Junction',
      distance: 'Approx 5.5 km (10-12 mins)',
      route: 'Proceed along Hill Palace Road towards Chottanikkara. At Eruvely junction, Elnix Tower is prominently visible on the main road.',
    },
    {
      from: 'From Kanjiramattom / Mulanthuruthy',
      distance: 'Approx 7.8 km (14 mins)',
      route: 'Head north via Chottanikkara road. Continue past the temple junction towards Eruvely.',
    },
    {
      from: 'From Vyttila Hub / Ernakulam City',
      distance: 'Approx 12 km (20-25 mins)',
      route: 'Take NH 66 bypass or Kundannoor - Petta road through Thripunithura directly to Eruvely.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-[#0b1a30] text-white py-16 lg:py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4 relative z-10">
            <span className="text-xs font-black tracking-widest text-sky-400 uppercase block">
              FLAGSHIP SHOWROOM & WAREHOUSE
            </span>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
              Visit Our Store in <span className="text-sky-400">Chottanikkara</span>
            </h1>
            <p className="text-slate-300 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Experience the vast selection of electricals, batteries, plumbing pipes, and luxury sanitaryware in person at Elnix Tower, Eruvely.
            </p>
          </div>
        </section>

        {/* Location Section */}
        <LocationSection />

        {/* Showroom Amenities */}
        <section className="py-20 bg-slate-50 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                VISITOR CONVENIENCE
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Showroom Features & Amenities
              </h2>
              <p className="text-sm text-slate-500">
                Designed to make your wholesale purchases and retail product selection effortless.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {amenities.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-lg transition-all"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Driving Directions Guide */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
                HOW TO REACH US
              </span>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Driving Directions
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {travelGuides.map((guide, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
                      {guide.distance}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1 mb-3">
                      {guide.from}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {guide.route}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <a
                href="https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-colors"
              >
                <Navigation className="w-4 h-4 text-sky-400" />
                <span>Open Google Navigation</span>
              </a>
            </div>
          </div>
        </section>

        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}

