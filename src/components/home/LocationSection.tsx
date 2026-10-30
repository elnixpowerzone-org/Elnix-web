'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, ExternalLink, Navigation } from 'lucide-react';

export default function LocationSection() {
  const googleMapsUrl = 'https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala';

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 space-y-2">
          <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
            OUR LOCATION
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Visit Our Store
          </h2>
          <p className="text-sm sm:text-base text-slate-500">
            Come and explore our wide range of products at our store.
          </p>
        </div>

        {/* 2 Columns: Contact info + Interactive Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-4">
              {/* Address */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Store Address
                  </h4>
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 leading-relaxed">
                    Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Contact Phone
                  </h4>
                  <a
                    href="tel:8848318521"
                    className="text-sm font-bold text-slate-800 hover:text-sky-600 transition-colors block mt-0.5"
                  >
                    8848 318 521
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </h4>
                  <a
                    href="mailto:elnixpowerzone@gmail.com"
                    className="text-sm font-bold text-slate-800 hover:text-sky-600 transition-colors block mt-0.5 truncate"
                  >
                    elnixpowerzone@gmail.com
                  </a>
                </div>
              </div>

              {/* Timings */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Working Hours
                  </h4>
                  <div className="text-xs font-semibold text-slate-800 mt-0.5 space-y-0.5">
                    <div>Mon - Sat: 9:00 AM - 8:00 PM</div>
                    <div className="text-slate-500">Sunday: 9:00 AM - 4:00 PM</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Directions Button */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-sky-600/20 transition-all hover:-translate-y-0.5 cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions</span>
            </a>
          </div>

          {/* Right Column: Styled Map Frame */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-slate-100 h-[420px]">
              {/* Interactive Google Map Embed */}
              <iframe
                title="Elnix Powerzone Store Location"
                src="https://maps.google.com/maps?q=Chottanikkara%2C%20Kerala%20682312&t=&z=14&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />

              {/* Floating Map Action Badge */}
              <div className="absolute top-4 right-4">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 text-slate-800 font-bold text-xs shadow-lg hover:bg-white transition-all backdrop-blur-xs border border-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>View on Google Maps</span>
                </a>
              </div>

              {/* Pin Pill bottom left */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-[#0b1a30]/90 text-white backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
                <div className="text-xs font-bold">
                  Elnix Powerzone • Eruvely Junction
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

