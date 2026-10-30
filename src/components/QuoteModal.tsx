'use client';

import React, { useState } from 'react';
import { X, Send, CheckCircle2, Phone, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProduct?: string;
  defaultCategory?: string;
}

export default function QuoteModal({
  isOpen,
  onClose,
  defaultProduct = '',
  defaultCategory = 'Batteries',
}: QuoteModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: defaultCategory,
    product_name: defaultProduct,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Required fields missing', {
        description: 'Please provide both your name and phone number.',
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting quote request...');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'quote',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success('Quote Request Received!', {
          id: toastId,
          description: 'Our sales team at Elnix Powerzone will contact you shortly.',
        });
      } else {
        throw new Error(data.error || 'Failed to submit quote request');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      toast.error('Submission failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    setFormData({
      name: '',
      phone: '',
      email: '',
      category: defaultCategory,
      product_name: defaultProduct,
      message: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Elnix brand styling */}
        <div className="bg-[#0b1a30] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Fast Wholesale & Retail Pricing</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight">Request a Quotation</h3>
          <p className="text-slate-300 text-sm mt-1">
            Get competitive pricing for homes, commercial complexes and contractor projects across Kerala.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Thank You, {formData.name}!</h4>
            <p className="text-sm text-slate-600 max-w-sm mx-auto leading-relaxed">
              We received your quote enquiry. An executive from our Eruvely store will contact you at{' '}
              <strong className="text-slate-900">{formData.phone}</strong> with wholesale rates and availability.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://wa.me/918848318521?text=Hi%20Elnix%20Powerzone,%20I%20just%20submitted%20a%20quote%20request%20on%20your%20website"
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              >
                Chat on WhatsApp Now
              </a>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Nair"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9847123456"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                >
                  <option value="Batteries">Batteries (Inverter & Auto)</option>
                  <option value="Electricals">Electricals & Wiring</option>
                  <option value="Plumbing">Plumbing & Pipes</option>
                  <option value="Sanitary">Sanitary & Bath Fittings</option>
                  <option value="Solar">Solar & Inverters</option>
                  <option value="General">Complete Project / Multiple</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Specific Product / Requirement Details
              </label>
              <textarea
                rows={3}
                placeholder="Specify brands, quantity, project location or model requirements..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <a
                href="tel:8848318521"
                className="text-xs font-medium text-slate-500 hover:text-sky-600 flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call 8848 318 521</span>
              </a>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-[#0b1a30] hover:bg-[#162a4a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    'Sending...'
                  ) : (
                    <>
                      <span>Submit Request</span>
                      <Send className="w-3.5 h-3.5 text-sky-400" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

