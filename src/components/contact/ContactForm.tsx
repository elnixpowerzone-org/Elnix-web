'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { StoreLocation } from '@/types';
import { toast } from 'sonner';

interface ContactFormProps {
  locations?: StoreLocation[];
  defaultLocationId?: string;
}

export type EnquiryCategoryType = 
  | 'Batteries'
  | 'Electricals'
  | 'Plumbing'
  | 'Sanitary'
  | 'Solar'
  | 'Complete Project'
  | 'Other';

export type EnquiryIntent =
  | 'product'
  | 'wholesale'
  | 'project'
  | 'dealer'
  | 'general';

export default function ContactForm({ locations = [], defaultLocationId }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    intent: 'wholesale' as EnquiryIntent,
    category: 'Batteries' as EnquiryCategoryType,
    product_name: '',
    preferred_location: defaultLocationId 
      ? locations.find(l => l.id === defaultLocationId)?.name || ''
      : '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Map user intent to canonical database enum ('general' | 'quote' | 'product')
  const mapIntentToDbType = (intent: EnquiryIntent): 'general' | 'quote' | 'product' => {
    switch (intent) {
      case 'product':
        return 'product';
      case 'wholesale':
      case 'project':
        return 'quote';
      case 'dealer':
      case 'general':
      default:
        return 'general';
    }
  };

  const getIntentLabel = (intent: EnquiryIntent): string => {
    switch (intent) {
      case 'wholesale':
        return 'Bulk / Wholesale Quote';
      case 'product':
        return 'Product Enquiry';
      case 'project':
        return 'Project Enquiry';
      case 'dealer':
        return 'Dealer / Distributor';
      case 'general':
      default:
        return 'General Enquiry';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Required fields missing', {
        description: 'Please enter your name, phone number, and message.',
      });
      return;
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Invalid phone number', {
        description: 'Please provide a valid 10-digit mobile number.',
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending your enquiry to Elnix Powerzone...');

    const dbType = mapIntentToDbType(formData.intent);
    const intentLabel = getIntentLabel(formData.intent);

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || undefined,
      type: dbType,
      category: `${formData.category} (${intentLabel})`,
      product_name: formData.product_name.trim() || undefined,
      preferred_location: formData.preferred_location || undefined,
      message: formData.message.trim(),
    };

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success('Enquiry Sent Successfully!', {
          id: toastId,
          description: 'Our customer support and sales team will contact you shortly.',
        });
      } else {
        throw new Error(data.error || 'Failed to submit enquiry');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error submitting message';
      toast.error('Submission failed', {
        id: toastId,
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200/90 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="text-[11px] font-black tracking-widest text-emerald-600 uppercase block">
          THANK YOU
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900">Enquiry Received Successfully!</h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Thank you, <strong>{formData.name}</strong>. Your enquiry regarding{' '}
          <strong>{formData.category}</strong> has been logged. Our wholesale team will get in touch with you at{' '}
          <strong>{formData.phone}</strong> promptly.
        </p>
        {formData.preferred_location && (
          <p className="text-xs text-sky-700 font-semibold bg-sky-50 py-1.5 px-3 rounded-lg max-w-md mx-auto border border-sky-100">
            Routing to: <strong>{formData.preferred_location}</strong>
          </p>
        )}
        <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/918848318521"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
          <button
            type="button"
            onClick={() => {
              setIsSuccess(false);
              setFormData({
                name: '',
                phone: '',
                email: '',
                intent: 'wholesale',
                category: 'Batteries',
                product_name: '',
                preferred_location: '',
                message: '',
              });
            }}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Send Another Enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="enquiry-form" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-sm scroll-mt-24">
      <div className="mb-6 space-y-1">
        <span className="text-[11px] font-black tracking-widest text-sky-600 uppercase block">
          SEND AN ENQUIRY
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Request Quotes & Assistance</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Fill in your details below and our team will respond with product pricing and availability.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enquiry Intent Type Selector */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Enquiry Type <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 bg-slate-100 rounded-xl">
            {(
              [
                { id: 'wholesale', label: 'Wholesale Quote' },
                { id: 'product', label: 'Product Info' },
                { id: 'project', label: 'Project Supply' },
                { id: 'dealer', label: 'Dealer Inquiry' },
                { id: 'general', label: 'General Help' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFormData({ ...formData, intent: item.id })}
                className={`py-2 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center truncate ${
                  formData.intent === item.id
                    ? 'bg-white text-slate-900 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Desktop Grid for inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Varma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="e.g. 9848 123 456"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="email"
              placeholder="e.g. anand@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Product Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as EnquiryCategoryType })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="Batteries">Batteries (Inverter & Automotive)</option>
              <option value="Electricals">Electricals, Wires, Cables & Switches</option>
              <option value="Plumbing">Plumbing, CPVC/UPVC Pipes & Fittings</option>
              <option value="Sanitary">Sanitaryware & Bath Fittings</option>
              <option value="Solar">Solar Systems & Hybrid Inverters</option>
              <option value="Complete Project">Complete Residential / Commercial Project</option>
              <option value="Other">Other Wholesale Requirements</option>
            </select>
          </div>

          {/* Specific Brand / Model */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Brand / Model <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Exide 150Ah / Polycab 2.5mm"
              value={formData.product_name}
              onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Preferred Location / Showroom */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Showroom / Location <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <select
              value={formData.preferred_location}
              onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all cursor-pointer"
            >
              <option value="">Any Location / Nearest Showroom</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name} {loc.branch_label ? `(${loc.branch_label})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Requirements / Message */}
        <div>
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Requirements / Quantity / Message <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            required
            placeholder="Describe your required items, quantity, project location, or specific brand preferences..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium text-slate-800 placeholder:text-slate-400 resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Submitting Your Enquiry...</span>
            </>
          ) : (
            <>
              <span>Submit Enquiry</span>
              <Send className="w-4 h-4 text-sky-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
