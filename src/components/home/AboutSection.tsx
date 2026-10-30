'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Layers, Users, HeartHandshake, ArrowRight } from 'lucide-react';

export default function AboutSection() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: 'Trusted Brands',
      description: 'Genuine products from leading brands',
    },
    {
      icon: Layers,
      title: 'Wide Range',
      description: 'Complete solutions under one roof',
    },
    {
      icon: Users,
      title: 'Expert Guidance',
      description: 'Support for homes and projects',
    },
    {
      icon: HeartHandshake,
      title: 'Customer Focus',
      description: 'Reliable service and long-term support',
    },
  ];

  return (
    <section className="py-20 bg-slate-50 border-t border-slate-200/60 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Store Exterior Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 group">
              <img
                src="/images/about-powerzone.jpg"
                alt="Elnix Powerzone Facility & Showroom"
                className="w-full h-[420px] object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a30] via-transparent to-transparent opacity-80" />
              
              {/* Overlay store badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-sky-600 uppercase tracking-widest">
                      ELNIX TOWER SHOWROOM
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      Eruvely, Chottanikkara, Ernakulam
                    </div>
                  </div>
                  <Link
                    href="/locations"
                    className="p-2.5 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: About Content */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
              ABOUT ELNIX POWERZONE
            </span>

            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Quality Products for <br />
              <span className="text-sky-600">a Brighter Tomorrow.</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Elnix Powerzone is a leading wholesale and retail supplier of electrical, battery, plumbing and sanitary products, located at Eruvely, Chottanikkara, Ernakulam. We are committed to providing genuine products, trusted brands and reliable support for residential, commercial and project requirements.
            </p>

            {/* 4 Feature Badges Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {highlights.map((h, i) => {
                const Icon = h.icon;
                return (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-shadow flex items-start gap-3.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {h.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {h.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-700 transition-colors group"
              >
                <span>Read our full company story</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

