'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Eye, 
  EyeOff, 
  Star, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Navigation, 
  X, 
  Save, 
  Compass, 
  ArrowUp, 
  ArrowDown, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StoreLocation } from '@/types';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'sonner';

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<StoreLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Partial<StoreLocation> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<StoreLocation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/locations', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLocations(data.data);
      }
    } catch {
      toast.error('Failed to load store locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenAdd = () => {
    setEditingLocation({
      name: '',
      branch_label: '',
      address: '',
      phone: '8848 318 521',
      whatsapp: '918848318521',
      email: 'elnixpowerzone@gmail.com',
      timings: 'Mon - Sat: 9:00 AM - 8:00 PM\nSunday: 9:00 AM - 4:00 PM',
      description: '',
      map_embed_url: '',
      map_directions_url: '',
      is_primary: locations.length === 0,
      is_visible: true,
      display_order: locations.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc: StoreLocation) => {
    setEditingLocation({
      ...loc,
      is_primary: loc.is_primary === true,
      is_visible: loc.is_visible !== false,
      display_order: loc.display_order ?? 1,
    });
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (loc: StoreLocation) => {
    const newStatus = !loc.is_visible;
    const toastId = toast.loading(`${newStatus ? 'Enabling' : 'Hiding'} ${loc.name}...`);

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...loc,
          is_visible: newStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Location is now ${newStatus ? 'visible on Contact page' : 'hidden from public view'}`, {
          id: toastId,
        });
        fetchLocations();
      } else {
        throw new Error(data.error || 'Failed to update visibility');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Failed to update status', { id: toastId, description: msg });
    }
  };

  const handleSetPrimary = async (loc: StoreLocation) => {
    if (loc.is_primary) return;
    const toastId = toast.loading(`Setting ${loc.name} as headquarters...`);

    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...loc,
          is_primary: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Headquarters Updated', {
          id: toastId,
          description: `${loc.name} is now the primary store location.`,
        });
        fetchLocations();
      } else {
        throw new Error(data.error || 'Failed to update primary location');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Update failed', { id: toastId, description: msg });
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= locations.length) return;

    const reordered = [...locations];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(newIndex, 0, moved);

    const orderedIds = reordered.map((l) => l.id);
    setLocations(reordered.map((l, i) => ({ ...l, display_order: i + 1 })));

    try {
      const res = await fetch('/api/locations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', orderedIds }),
      });
      if (!res.ok) throw new Error('Failed to update order');
      toast.success('Display order updated');
    } catch {
      toast.error('Failed to persist order');
      fetchLocations();
    }
  };

  // Helper: Extract valid embed URL if user pasted an iframe
  const parseEmbedUrlInput = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.includes('<iframe')) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        return match[1];
      }
    }
    return trimmed;
  };

  const handleAutoGenerateMapUrls = () => {
    if (!editingLocation) return;
    const query = editingLocation.address || editingLocation.name || 'Elnix Powerzone Kerala';
    const encoded = encodeURIComponent(query);
    setEditingLocation({
      ...editingLocation,
      map_embed_url: `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`,
      map_directions_url: `https://maps.google.com/?q=${encoded}`,
    });
    toast.info('Generated Google Maps Embed & Directions URLs from Address');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLocation?.name?.trim() || !editingLocation?.address?.trim()) {
      toast.error('Required fields missing', {
        description: 'Please provide both the location name and full address.',
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving store location...');

    try {
      const payload: Partial<StoreLocation> = {
        ...editingLocation,
        name: editingLocation.name.trim(),
        branch_label: editingLocation.branch_label?.trim() || 'Store Branch',
        address: editingLocation.address.trim(),
        phone: editingLocation.phone?.trim() || '8848 318 521',
        whatsapp: editingLocation.whatsapp?.trim() || '918848318521',
        email: editingLocation.email?.trim() || '',
        timings: editingLocation.timings?.trim() || 'Mon - Sat: 9:00 AM - 8:00 PM',
        description: editingLocation.description?.trim() || '',
        map_embed_url: parseEmbedUrlInput(editingLocation.map_embed_url || ''),
        map_directions_url: editingLocation.map_directions_url?.trim() || '',
        is_primary: editingLocation.is_primary === true,
        is_visible: editingLocation.is_visible !== false,
        display_order: Number(editingLocation.display_order) || 1,
      };

      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Location Saved!', {
          id: toastId,
          description: `${payload.name} was successfully stored.`,
        });
        setIsModalOpen(false);
        fetchLocations();
      } else {
        throw new Error(data.error || 'Failed to save location');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Save failed', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!locationToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting location...');

    try {
      const res = await fetch(`/api/locations?id=${encodeURIComponent(locationToDelete.id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Location Deleted', {
          id: toastId,
          description: `${locationToDelete.name} was permanently removed.`,
        });
        setShowDeleteModal(false);
        setLocationToDelete(null);
        fetchLocations();
      } else {
        throw new Error(data.error || 'Delete failed');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Delete failed', { id: toastId, description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Helper to resolve embed iframe URL
  const getEmbedPreviewUrl = (loc: Partial<StoreLocation>): string => {
    if (loc.map_embed_url) {
      return parseEmbedUrlInput(loc.map_embed_url);
    }
    if (loc.latitude && loc.longitude) {
      return `https://maps.google.com/maps?q=${loc.latitude},${loc.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    if (loc.address) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(loc.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
    return '';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>MULTI-BRANCH CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Store & Office Locations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage your network of showrooms, wholesale warehouses, and contractor desks. Each location displays with its own mini Google Map preview, phone line, and WhatsApp link on the public Contact page.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/contact"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Contact Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add Location</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Locations</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{locations.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Live on Website</span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {locations.filter((l) => l.is_visible !== false).length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Eye className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Headquarters / Primary</span>
            <div className="text-sm font-black text-slate-900 truncate max-w-[200px] mt-1">
              {locations.find((l) => l.is_primary)?.name || 'None Set'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>
      </div>

      {/* Locations List */}
      {isLoading ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-500">Loading store locations...</p>
        </div>
      ) : locations.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Store Locations Configured</h3>
          <p className="text-xs max-w-md mx-auto text-slate-500">
            Click &quot;Add Location&quot; to configure your primary showroom, branches, or distribution warehouses.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Add First Location</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {locations.map((loc, idx) => {
            const isVisible = loc.is_visible !== false;
            const embedUrl = getEmbedPreviewUrl(loc);

            return (
              <div
                key={loc.id}
                className={`bg-white rounded-3xl border transition-all p-6 sm:p-7 shadow-2xs hover:shadow-md ${
                  loc.is_primary ? 'border-sky-300 ring-2 ring-sky-500/10' : 'border-slate-200/90'
                } ${!isVisible ? 'opacity-70 bg-slate-50/50 border-dashed' : ''}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Location Info & Meta */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Primary Badge */}
                      {loc.is_primary ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-black uppercase tracking-wider shadow-2xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>Headquarters & Main Showroom</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(loc)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 hover:bg-amber-50 text-slate-600 hover:text-amber-700 border border-slate-200 hover:border-amber-200 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          <Star className="w-3 h-3 text-slate-400 hover:text-amber-500" />
                          <span>Set as Primary</span>
                        </button>
                      )}

                      {/* Display Order Badge */}
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold font-mono">
                        #{loc.display_order ?? idx + 1}
                      </span>

                      {/* Visibility Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(loc)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                          isVisible
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                      >
                        {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                      </button>

                      {/* Move Order Controls */}
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === locations.length - 1}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Location Title & Branch */}
                    <div>
                      <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 block">
                        {loc.branch_label || 'Branch Store'}
                      </span>
                      <h3 className="text-xl font-black text-slate-900 mt-0.5">
                        {loc.name}
                      </h3>
                      {loc.description && (
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {loc.description}
                        </p>
                      )}
                    </div>

                    {/* Address & Contact Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                      {/* Address */}
                      <div className="sm:col-span-2 flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                            Address
                          </span>
                          <span className="font-medium text-slate-800 leading-snug block mt-0.5">
                            {loc.address}
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Phone className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                            Phone
                          </span>
                          <span className="font-bold text-slate-800">{loc.phone || '8848 318 521'}</span>
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px]">
                            WhatsApp
                          </span>
                          <span className="font-bold text-emerald-700">+{loc.whatsapp || '918848318521'}</span>
                        </div>
                      </div>

                      {/* Email */}
                      {loc.email && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div className="truncate">
                            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                              Email
                            </span>
                            <span className="font-medium text-slate-800 truncate block">{loc.email}</span>
                          </div>
                        </div>
                      )}

                      {/* Timings */}
                      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                            Timings
                          </span>
                          <span className="font-medium text-slate-800 whitespace-pre-line leading-tight block">
                            {loc.timings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Mini Map Preview & Action Buttons */}
                  <div className="lg:col-span-5 space-y-3">
                    {/* Embedded Mini Map Preview */}
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-44 w-full shadow-inner">
                      {embedUrl ? (
                        <iframe
                          title={`${loc.name} Map Preview`}
                          src={embedUrl}
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400">
                          <Compass className="w-8 h-8 mb-1 text-slate-300" />
                          <span className="text-xs font-semibold">No embed map URL provided</span>
                          <span className="text-[11px] text-slate-400">Address query will be used as fallback</span>
                        </div>
                      )}

                      {/* Floating Directions Badge */}
                      <div className="absolute top-2.5 right-2.5">
                        <a
                          href={loc.map_directions_url || `https://maps.google.com/?q=${encodeURIComponent(loc.address)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/95 hover:bg-white text-slate-800 font-bold text-[10px] shadow-md border border-slate-200 transition-colors"
                        >
                          <Navigation className="w-3 h-3 text-sky-600" />
                          <span>Test Directions</span>
                        </a>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEdit(loc)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 text-slate-600" />
                        <span>Edit Location</span>
                      </button>

                      <button
                        onClick={() => {
                          setLocationToDelete(loc);
                          setShowDeleteModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT LOCATION MODAL */}
      {isModalOpen && editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="bg-[#0b1a30] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">
                  STORE MANAGEMENT
                </span>
                <h3 className="text-xl font-black">
                  {editingLocation.id ? 'Edit Location' : 'Add New Location'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Location Name & Branch Label */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location / Showroom Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Elnix Powerzone — Flagship Showroom & Warehouse"
                    value={editingLocation.name || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Branch / Store Label
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Headquarters / Main Showroom, Ernakulam Hub"
                    value={editingLocation.branch_label || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, branch_label: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={editingLocation.display_order ?? 1}
                    onChange={(e) => setEditingLocation({ ...editingLocation, display_order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Physical Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India"
                  value={editingLocation.address || ''}
                  onChange={(e) => setEditingLocation({ ...editingLocation, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                />
              </div>

              {/* Phone, WhatsApp, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="8848 318 521"
                    value={editingLocation.phone || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="918848318521"
                    value={editingLocation.whatsapp || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, whatsapp: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="elnixpowerzone@gmail.com"
                    value={editingLocation.email || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Timings & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Working Hours & Days
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mon - Sat: 9:00 AM - 8:00 PM&#10;Sunday: 9:00 AM - 4:00 PM"
                    value={editingLocation.timings || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, timings: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Short Description (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief highlight of showroom amenities or wholesale counter..."
                    value={editingLocation.description || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, description: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Google Maps Configuration */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Google Maps Configuration</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAutoGenerateMapUrls}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-100 hover:bg-sky-200 text-sky-800 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Auto-Fill from Address</span>
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Google Maps Embed URL or &lt;iframe&gt; code
                  </label>
                  <input
                    type="text"
                    placeholder="https://maps.google.com/maps?q=...&output=embed or paste full <iframe> tag"
                    value={editingLocation.map_embed_url || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, map_embed_url: parseEmbedUrlInput(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Paste standard Google Maps embed URL or iframe code. It will render in the mini map card on the Contact page.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Google Maps Directions URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://maps.google.com/?q=Elnix+Tower+Chottanikkara"
                    value={editingLocation.map_directions_url || ''}
                    onChange={(e) => setEditingLocation({ ...editingLocation, map_directions_url: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-800"
                  />
                </div>

                {/* Optional Coordinates */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Latitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="9.9328"
                      value={editingLocation.latitude ?? ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, latitude: parseFloat(e.target.value) || undefined })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Longitude (Optional)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="76.3776"
                      value={editingLocation.longitude ?? ''}
                      onChange={(e) => setEditingLocation({ ...editingLocation, longitude: parseFloat(e.target.value) || undefined })}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Live Modal Map Preview */}
                {getEmbedPreviewUrl(editingLocation) && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Live Embed Preview:
                    </span>
                    <div className="h-32 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <iframe
                        title="Embed Preview"
                        src={getEmbedPreviewUrl(editingLocation)}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Toggles: Primary HQ & Public Visibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Primary HQ Toggle */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Primary / Headquarters</span>
                    <span className="text-[11px] text-slate-500">Highlight as flagship showroom</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLocation.is_primary === true}
                      onChange={(e) => setEditingLocation({ ...editingLocation, is_primary: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Visible Toggle */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Visible on Website</span>
                    <span className="text-[11px] text-slate-500">Show on public Contact page</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingLocation.is_visible !== false}
                      onChange={(e) => setEditingLocation({ ...editingLocation, is_visible: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
                  </label>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#0b1a30] hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Save className="w-4 h-4 text-sky-400" />
                  <span>{isSaving ? 'Saving...' : 'Save Location'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Store Location?"
        message={`Are you sure you want to permanently delete "${locationToDelete?.name}"? It will immediately disappear from the public Contact page.`}
        itemTitle={locationToDelete?.name}
        confirmLabel="Yes, Delete Location"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setLocationToDelete(null);
        }}
      />
    </div>
  );
}

