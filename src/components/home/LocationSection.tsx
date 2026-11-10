'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  ExternalLink, 
  Navigation, 
  ArrowRight, 
  Building2,
  Store
} from 'lucide-react';
import { StoreLocation } from '@/types';

interface LocationSectionProps {
  locations?: StoreLocation[];
  location?: StoreLocation;
}

export default function LocationSection({ 
  locations: initialLocations, 
  location: initialSingleLocation 
}: LocationSectionProps) {
  const [locations, setLocations] = useState<StoreLocation[]>(
    initialLocations || (initialSingleLocation ? [initialSingleLocation] : [])
  );

  useEffect(() => {
    if (initialLocations && initialLocations.length > 0) {
      setLocations(initialLocations);
      return;
    }

    if (initialSingleLocation) {
      setLocations([initialSingleLocation]);
      return;
    }

    // Fetch live locations from API if not provided via props
    fetch('/api/locations?public=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setLocations(data.data);
        }
      })
      .catch(() => {});
  }, [initialLocations, initialSingleLocation]);

  // Helper to resolve embed URL for each shop
  const getEmbedUrl = (loc: StoreLocation): string => {
    if (loc.map_embed_url) {
      const trimmed = loc.map_embed_url.trim();
      if (trimmed.includes('<iframe')) {
        const match = trimmed.match(/src=["']([^"']+)["']/i);
        if (match && match[1]) return match[1];
      }
      return trimmed;
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(loc.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <section className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-12">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
              OUR STORE LOCATIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Our Shops
            </h2>
            <p className="text-sm sm:text-base text-slate-500 max-w-2xl">
              Visit our stores for genuine electrical, battery, solar, plumbing, and sanitary products.
            </p>
          </div>

          <Link
            href="/contact#locations"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-800 hover:text-sky-600 text-xs font-bold border border-slate-200 hover:border-sky-200 transition-colors self-start sm:self-auto shrink-0 cursor-pointer"
          >
            <span>View on Contact Page</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Both Shops Grid (Side-by-side on desktop) */}
        <div className={`grid grid-cols-1 ${locations.length > 1 ? 'lg:grid-cols-2' : ''} gap-8`}>
          {locations.map((loc) => {
            const embedUrl = getEmbedUrl(loc);
            const googleMapsUrl = loc.map_directions_url || `https://maps.google.com/?q=${encodeURIComponent(loc.address)}`;
            const cleanPhone = (loc.phone || '').replace(/[^0-9]/g, '');

            return (
              <div 
                key={loc.id} 
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
              >
                {/* Shop Image on TOP of Location Card */}
                {loc.image_url ? (
                  <div className="relative h-72 sm:h-84 lg:h-[380px] w-full bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
                    <img 
                      src={loc.image_url} 
                      alt={`${loc.name} Storefront`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                ) : (
                  <div className="relative h-60 sm:h-72 lg:h-[380px] w-full bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center text-slate-400 p-6 text-center border-b border-slate-100">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-sky-600 mb-2">
                      <Store className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">{loc.name}</span>
                    <span className="text-xs text-slate-400 mt-1">Shop photo can be uploaded from Admin</span>
                  </div>
                )}

                {/* Card Content */}
                <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Shop Name */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                        {loc.name}
                      </h3>
                    </div>

                    {loc.description && (
                      <p className="text-xs sm:text-sm text-slate-600 mt-2.5 leading-relaxed">
                        {loc.description}
                      </p>
                    )}

                    {/* Details: Address, Mob, Timings */}
                    <div className="space-y-3 mt-4">
                      {/* Address */}
                      <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <MapPin className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Address
                          </h4>
                          <p className="text-sm font-semibold text-slate-900 mt-0.5 leading-relaxed">
                            {loc.address}
                          </p>
                        </div>
                      </div>

                      {/* Mob / Contact Phone */}
                      <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                        <Phone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            Mob / Phone
                          </h4>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors block mt-0.5"
                          >
                            {loc.phone}
                          </a>
                        </div>
                      </div>

                      {/* Working Hours */}
                      {loc.timings && (
                        <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Working Hours
                            </h4>
                            <div className="text-xs font-semibold text-slate-800 mt-0.5 whitespace-pre-line leading-relaxed">
                              {loc.timings}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Google Map Embed for this specific shop */}
                  <div className="pt-2">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-52 sm:h-56 w-full shadow-inner">
                      <iframe
                        title={`${loc.name} Location Map`}
                        src={embedUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                      />
                      <div className="absolute top-2.5 right-2.5">
                        <a
                          href={googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-md hover:bg-white border border-slate-200 transition-all backdrop-blur-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                          <span>View on Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons: Get Directions & Call */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
                    >
                      <Navigation className="w-4 h-4" />
                      <span>Get Directions</span>
                    </a>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0b1a30] hover:bg-[#162a4a] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer text-center"
                    >
                      <Phone className="w-4 h-4 text-sky-400" />
                      <span>Call Store</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
