'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Save, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle, 
  ArrowRight, 
  FileText,
  Sparkles
} from 'lucide-react';
import { SiteSettings } from '@/types';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.data) {
        setSettings({
          ...data.data,
          contact_eyebrow: data.data.contact_eyebrow || 'GET IN TOUCH',
          contact_heading: data.data.contact_heading || "We're Here to Help",
          contact_description: data.data.contact_description || 'Connect with our wholesale specialists for genuine electricals, inverters, plumbing lines, and sanitaryware. Visit our showroom, call directly, or request a customized project quote.',
          contact_enquiry_info: data.data.contact_enquiry_info || 'Wholesale and retail inquiries are handled promptly by our experienced technical team.',
        });
      }
    } catch {
      toast.error('Failed to load store settings');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    const toastId = toast.loading('Saving store and contact settings...');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Settings Updated!', {
          id: toastId,
          description: 'Store contact details and Contact Page text updated across the website.',
        });
      } else {
        throw new Error(data.error || 'Failed to update settings');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Update failed', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="p-12 text-center text-sm font-bold text-slate-400">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            GENERAL STORE CONFIGURATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5">
            Store & Contact Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Update phone numbers, WhatsApp lines, business hours, and public Contact page copy.
          </p>
        </div>

        {/* Quick Shortcut to Locations */}
        <Link
          href="/admin/locations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs border border-sky-200 transition-colors shrink-0"
        >
          <MapPin className="w-4 h-4 text-sky-600" />
          <span>Manage Locations</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* SECTION 1: PRIMARY CONTACT CHANNELS */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black tracking-widest text-sky-600 uppercase block">
              COMMUNICATION CHANNELS
            </span>
            <h3 className="text-lg font-black text-slate-900">Direct Contact Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Store Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.store_name}
                onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone (Header & Contact Page)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp Number (e.g. 918848318521)
              </label>
              <div className="relative">
                <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={settings.whatsapp}
                  onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Customer Support Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Headquarters Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  required
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                General Business Hours & Store Timings
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  required
                  value={settings.timings}
                  onChange={(e) => setSettings({ ...settings, timings: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Wholesale Tagline / Subtitle
              </label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONTACT PAGE CONTENT CUSTOMIZATION */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-md space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-[10px] font-black tracking-widest text-sky-600 uppercase block">
              PAGE COPYWRITING
            </span>
            <h3 className="text-lg font-black text-slate-900">Contact Page Hero & Introduction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the titles and description displayed at the top of the public /contact page.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Eyebrow Text
              </label>
              <input
                type="text"
                value={settings.contact_eyebrow || ''}
                placeholder="GET IN TOUCH"
                onChange={(e) => setSettings({ ...settings, contact_eyebrow: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Main Heading
              </label>
              <input
                type="text"
                value={settings.contact_heading || ''}
                placeholder="We're Here to Help"
                onChange={(e) => setSettings({ ...settings, contact_heading: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hero Welcoming Description
              </label>
              <textarea
                rows={3}
                value={settings.contact_description || ''}
                placeholder="Connect with our wholesale specialists for genuine electricals, inverters, plumbing lines, and sanitaryware. Visit our showroom, call directly, or request a customized project quote."
                onChange={(e) => setSettings({ ...settings, contact_description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                General Enquiry / Wholesale Support Note
              </label>
              <textarea
                rows={2}
                value={settings.contact_enquiry_info || ''}
                placeholder="Direct wholesale and retail support across Kerala for electrical contractors, builders, and home owners."
                onChange={(e) => setSettings({ ...settings, contact_enquiry_info: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-normal text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Changes update immediately on the live storefront.</span>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-sky-400" />
            <span>{isSaving ? 'Saving Changes...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
