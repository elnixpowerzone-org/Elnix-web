'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Navigation, 
  MessageCircle, 
  Star, 
  ExternalLink,
  Compass
} from 'lucide-react';
import { StoreLocation } from '@/types';

interface LocationCardProps {
  location: StoreLocation;
}

export default function LocationCard({ location }: LocationCardProps) {
  const [mapError, setMapError] = useState(false);

  // Clean phone and WhatsApp
  const rawPhone = location.phone || '8848 318 521';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const rawWhatsApp = location.whatsapp || '918848318521';
  const cleanWhatsApp = rawWhatsApp.replace(/[^0-9]/g, '');

  const whatsappMessage = encodeURIComponent(
    `Hello Elnix Powerzone, I am contacting you regarding your ${location.name} (${location.branch_label || 'Showroom'}). Could you assist me with product inquiries?`
  );
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${whatsappMessage}`;

  // Resolve Directions URL
  const directionsUrl =
    location.map_directions_url ||
    (location.latitude && location.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : `https://maps.google.com/?q=${encodeURIComponent(location.address || location.name)}`);

  // Helper to extract clean embed src
  const getEmbedUrl = (): string => {
    if (location.map_embed_url) {
      const trimmed = location.map_embed_url.trim();
      if (trimmed.includes('<iframe')) {
        const match = trimmed.match(/src=["']([^"']+)["']/i);
        if (match && match[1]) return match[1];
      }
      return trimmed;
    }
    if (location.latitude && location.longitude) {
      return `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    if (location.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(location.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return '';
  };

  const embedUrl = getEmbedUrl();

  return (
    <div 
      className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-2xs hover:shadow-xl flex flex-col justify-between group ${
        location.is_primary ? 'border-sky-300 ring-2 ring-sky-500/10' : 'border-slate-200/90'
      }`}
    >
      {/* Shop Image on TOP of Location Card */}
      {location.image_url && (
        <div className="relative h-64 sm:h-72 lg:h-80 w-full bg-slate-100 overflow-hidden shrink-0 border-b border-slate-100">
          <img
            src={location.image_url}
            alt={`${location.name} Storefront`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Top Details Area */}
      <div className="p-6 sm:p-7 space-y-4">
        {/* Header Badge (optional) */}
        {location.branch_label ? (
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
              {location.branch_label}
            </span>
          </div>
        ) : null}

        {/* Location Title & Description */}
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
            {location.name}
          </h3>
          {location.description && (
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {location.description}
            </p>
          )}
        </div>

        {/* Mini Google Map Preview Area */}
        <div className="pt-1">
          <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner group">
            {!mapError && embedUrl ? (
              <iframe
                title={`${location.name} Google Map Location`}
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setMapError(true)}
                className="w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-500 space-y-2">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">{location.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{location.address}</p>
                </div>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1a30] hover:bg-sky-600 text-white text-[11px] font-bold transition-colors"
                >
                  <Navigation className="w-3 h-3 text-sky-400" />
                  <span>Open in Google Maps</span>
                </a>
              </div>
            )}

            {/* Floating Map Label Badge */}
            <div className="absolute top-2.5 right-2.5 pointer-events-auto">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 text-slate-800 text-[10px] font-bold shadow-md hover:bg-white border border-slate-200 backdrop-blur-xs transition-colors"
                title="Open larger map in Google Maps"
              >
                <ExternalLink className="w-3 h-3 text-sky-600" />
                <span>View Larger Map</span>
              </a>
            </div>

            {/* Bottom Location Pill inside map */}
            <div className="absolute bottom-2.5 left-2.5 p-1.5 px-2.5 rounded-lg bg-[#0b1a30]/85 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1.5 shadow-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="truncate max-w-[200px]">{location.name}</span>
            </div>
          </div>
        </div>

        {/* Address and Store Details */}
        <div className="space-y-2.5 pt-1 text-xs">
          {/* Address */}
          <div className="flex items-start gap-2.5 text-slate-700">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium text-slate-700">{location.address}</span>
          </div>

          {/* Timings */}
          {location.timings && (
            <div className="flex items-start gap-2.5 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span className="leading-snug whitespace-pre-line">{location.timings}</span>
            </div>
          )}

          {/* Email */}
          {location.email && (
            <div className="flex items-center gap-2.5 text-slate-600 truncate">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a 
                href={`mailto:${location.email}`}
                className="hover:text-sky-600 transition-colors truncate font-medium"
              >
                {location.email}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Buttons (Direct Contact CTAs) */}
      <div className="p-4 sm:p-6 pt-0 border-t border-slate-100 mt-4 bg-slate-50/50">
        <div className="grid grid-cols-3 gap-2 pt-4">
          {/* Directions Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
            title="Get driving directions in Google Maps"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">Directions</span>
          </a>

          {/* Call Location */}
          <a
            href={`tel:${cleanPhone}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold transition-colors shadow-2xs text-center cursor-pointer"
            title={`Call ${rawPhone}`}
          >
            <Phone className="w-3.5 h-3.5 text-sky-600" />
            <span className="truncate">Call</span>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs text-center cursor-pointer"
            title="Chat directly on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="truncate">WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

