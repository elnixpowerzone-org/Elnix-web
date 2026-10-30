'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'general' as 'general' | 'quote' | 'product',
    category: 'Batteries',
    product_name: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      toast.error('Required fields missing', {
        description: 'Please provide your name, phone number, and enquiry details.',
      });
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Sending your enquiry to Elnix Powerzone...');

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsSuccess(true);
        toast.success('Enquiry Sent Successfully!', {
          id: toastId,
          description: 'Our customer support team at Eruvely will get back to you shortly.',
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
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-2xl font-black text-slate-900">Message Received!</h3>
        <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
          Thank you, <strong>{formData.name}</strong>. Our team has received your inquiry regarding <strong>{formData.category}</strong>. We will contact you at <strong>{formData.phone}</strong> promptly.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/918848318521"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
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
                type: 'general',
                category: 'Batteries',
                product_name: '',
                message: '',
              });
            }}
            className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl">
      <div className="mb-6 space-y-1">
        <span className="text-xs font-black tracking-widest text-sky-600 uppercase block">
          ONLINE ENQUIRY
        </span>
        <h3 className="text-2xl font-black text-slate-900">Send Us a Message</h3>
        <p className="text-xs sm:text-sm text-slate-500">
          Fill out the details below and our team will get back to you with pricing, stock status or technical advice.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Enquiry Type Selector */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-2xl">
          {(['general', 'quote', 'product'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFormData({ ...formData, type: t })}
              className={`py-2 text-xs font-bold capitalize rounded-xl transition-all cursor-pointer ${
                formData.type === t
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'quote' ? 'Wholesale Quote' : t === 'product' ? 'Product Info' : 'General Enquiry'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Varma"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
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
              placeholder="e.g. anand@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Product Department
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all cursor-pointer"
            >
              <option value="Batteries">Batteries (Inverter & Automotive)</option>
              <option value="Electricals">Electricals, Wires & Switches</option>
              <option value="Plumbing">Plumbing, Pipes & Valves</option>
              <option value="Sanitary">Sanitaryware & Bath Fittings</option>
              <option value="Solar">Solar Systems</option>
              <option value="Complete Project">Complete Commercial/Home Project</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Target Product Name / Requirements <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            required
            placeholder="Tell us what you are looking for, required brand, quantity, delivery location or project stage..."
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all font-medium resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 px-6 bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            'Submitting Enquiry...'
          ) : (
            <>
              <span>Send Enquiry Now</span>
              <Send className="w-4 h-4 text-sky-400" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

