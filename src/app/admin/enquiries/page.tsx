'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Phone, 
  MessageCircle, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  User
} from 'lucide-react';
import { Enquiry } from '@/types';
import { toast } from 'sonner';

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/enquiries');
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.data);
      }
    } catch {
      toast.error('Failed to load enquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: Enquiry['status'], notes?: string) => {
    const toastId = toast.loading('Updating enquiry status...');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Status Updated', {
          id: toastId,
          description: `Lead status changed to "${status}".`,
        });
        setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, status, notes: notes !== undefined ? notes : e.notes } : e)));
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Update failed', { id: toastId, description: msg });
    }
  };

  const filtered = enquiries.filter((e) => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q) ||
        e.message.toLowerCase().includes(q) ||
        e.category?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            CUSTOMER PIPELINE & LEADS
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Enquiries & Quotation Requests</h1>
          <p className="text-xs text-slate-500">
            Real-time inquiries and wholesale quote submissions from customers across Kerala.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200">
            {enquiries.filter(e => e.status === 'pending').length} Pending
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
            {enquiries.filter(e => e.status === 'completed').length} Completed
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or requirement..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          {(['all', 'pending', 'contacted', 'completed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#0b1a30] text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Enquiries List Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">
            Loading customer leads...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No enquiries matching this criteria.
          </div>
        ) : (
          filtered.map((enq) => {
            const cleanPhone = enq.phone.replace(/[^0-9]/g, '');
            const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
              `Hello ${enq.name}, thank you for contacting Elnix Powerzone regarding "${enq.category || 'products'}". How can we assist you with your pricing and availability today?`
            )}`;

            return (
              <div
                key={enq.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-shadow p-6 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{enq.name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-100">
                          {enq.type === 'quote' ? 'Quotation' : enq.type === 'product' ? 'Product' : 'General'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{new Date(enq.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
                    <select
                      value={enq.status}
                      onChange={(e) => handleUpdateStatus(enq.id, e.target.value as Enquiry['status'])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border cursor-pointer focus:outline-none ${
                        enq.status === 'pending'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : enq.status === 'contacted'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                {/* Enquiry Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-8 space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Department / Requirement: <span className="text-sky-600 font-extrabold">{enq.category || 'General Products'}</span>
                    </div>
                    {enq.product_name && (
                      <div className="text-xs font-semibold text-slate-700">
                        Item: {enq.product_name}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                      {enq.message}
                    </p>
                  </div>

                  {/* Contact CTAs */}
                  <div className="md:col-span-4 flex flex-col justify-between gap-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-bold">
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <span>{enq.phone}</span>
                      </div>
                      {enq.email && (
                        <div className="flex items-center gap-2 text-slate-600 truncate">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{enq.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Phone className="w-3.5 h-3.5 text-sky-600" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Internal Staff Notes */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                  <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Add internal staff note (e.g. Quoted ₹14,200 on WhatsApp, awaiting PO)..."
                    defaultValue={enq.notes || ''}
                    onBlur={(e) => {
                      if (e.target.value !== enq.notes) {
                        handleUpdateStatus(enq.id, enq.status, e.target.value);
                      }
                    }}
                    className="flex-1 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none py-1 text-slate-700"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

