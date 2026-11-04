'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Globe, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Brand } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import ConfirmationModal from '@/components/ConfirmationModal';
import BrandLogo from '@/components/home/BrandLogo';
import { AUTHENTIC_BRAND_SVGS } from '@/lib/brandLogos';
import { toast } from 'sonner';

const BRAND_PRESETS = [
  { name: 'Amaron', slug: 'amaron', website: 'https://www.amaron.in', logo_url: AUTHENTIC_BRAND_SVGS.amaron },
  { name: 'Exide', slug: 'exide', website: 'https://www.exideindustries.com', logo_url: AUTHENTIC_BRAND_SVGS.exide },
  { name: 'Luminous', slug: 'luminous', website: 'https://www.luminousindia.com', logo_url: AUTHENTIC_BRAND_SVGS.luminous },
  { name: 'V-Guard', slug: 'v-guard', website: 'https://www.vguard.in', logo_url: AUTHENTIC_BRAND_SVGS['v-guard'] },
  { name: 'Racold', slug: 'racold', website: 'https://www.racold.com', logo_url: AUTHENTIC_BRAND_SVGS.racold },
];

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Partial<Brand> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/brands');
      const data = await res.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch {
      toast.error('Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleOpenAdd = () => {
    setEditingBrand({
      name: '',
      slug: '',
      logo_url: '',
      public_id: '',
      website: '',
      is_channel_partner: true,
      display_order: brands.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof BRAND_PRESETS[0]) => {
    setEditingBrand({
      name: preset.name,
      slug: preset.slug,
      logo_url: preset.logo_url,
      public_id: '',
      website: preset.website,
      is_channel_partner: true,
      display_order: brands.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand({
      ...brand,
      is_channel_partner: brand.is_channel_partner !== false,
      display_order: brand.display_order ?? 1,
      website: brand.website || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (b: Brand) => {
    const updatedStatus = b.is_channel_partner === false ? true : false;
    const toastId = toast.loading(`${updatedStatus ? 'Enabling' : 'Hiding'} ${b.name}...`);

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...b,
          is_channel_partner: updatedStatus,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${b.name} is now ${updatedStatus ? 'visible on homepage' : 'hidden from homepage'}`, { id: toastId });
        fetchBrands();
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Failed to update brand', { id: toastId, description: msg });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand?.name) {
      toast.error('Brand name is required');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving brand...');

    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingBrand),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Brand Saved!', {
          id: toastId,
          description: `${editingBrand.name} was successfully updated.`,
        });
        setIsModalOpen(false);
        fetchBrands();
      } else {
        throw new Error(data.error || 'Failed to save brand');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Save failed', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!brandToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting brand...');

    try {
      if (brandToDelete.public_id) {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: brandToDelete.public_id }),
        });
      }

      const params = new URLSearchParams();
      if (brandToDelete.id) params.set('id', brandToDelete.id);
      if (brandToDelete.slug) params.set('slug', brandToDelete.slug);
      if (brandToDelete.name) params.set('name', brandToDelete.name);

      const res = await fetch(`/api/brands?${params.toString()}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Brand Removed', {
          id: toastId,
          description: `${brandToDelete.name} was removed from the partner network.`,
        });
        setShowDeleteModal(false);
        setBrandToDelete(null);
        fetchBrands();
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            MANUFACTURER PARTNERSHIPS
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Channel Partner Brands</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage partner logos, destination links, display ordering, and homepage visibility in the integrated brands showcase.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Quick Partner Presets:</span>
        </div>
        {BRAND_PRESETS.map((p) => {
          const alreadyExists = brands.some((b) => b.name.toLowerCase() === p.name.toLowerCase());
          return (
            <button
              key={p.name}
              type="button"
              disabled={alreadyExists}
              onClick={() => handleApplyPreset(p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-700 hover:text-sky-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>{p.name}</span>
              {alreadyExists ? <span className="text-[10px] text-slate-400 font-normal">(Added)</span> : <span className="text-sky-600 font-black">+</span>}
            </button>
          );
        })}
      </div>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-medium text-slate-400">Loading brands...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {brands.map((b) => {
            const isVisible = b.is_channel_partner !== false;

            return (
              <div
                key={b.id || b.slug}
                className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between group shadow-2xs hover:shadow-md ${
                  isVisible ? 'border-slate-200/90' : 'border-dashed border-slate-300 opacity-70'
                }`}
              >
                {/* Brand Preview Container */}
                <div className="aspect-3/2 w-full rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-3 mb-3 relative overflow-hidden">
                  <BrandLogo brand={b} />

                  {/* Order Badge */}
                  <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                    #{b.display_order ?? 1}
                  </span>
                </div>

                <div className="text-center space-y-1">
                  <div className="text-xs font-bold text-slate-900 truncate">{b.name}</div>
                  
                  {/* Status Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(b)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-colors ${
                      isVisible ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {isVisible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    <span>{isVisible ? 'Shown' : 'Hidden'}</span>
                  </button>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {b.website ? (
                    <a
                      href={b.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-sky-600 p-1"
                      title="Visit Website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(b)}
                      className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Edit Brand"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setBrandToDelete(b);
                        setShowDeleteModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Brand Modal */}
      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-[#0b1a30] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">
                  BRAND PROFILE
                </span>
                <h3 className="text-xl font-black">
                  {editingBrand.id ? 'Edit Brand' : 'Add Channel Brand'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <ImageUploader
                label="Brand Logo (Cloudinary, SVG, or URL)"
                value={editingBrand.logo_url}
                publicId={editingBrand.public_id}
                folder="elnix_brands"
                onChange={(url, publicId) => {
                  setEditingBrand({
                    ...editingBrand,
                    logo_url: url,
                    public_id: publicId || '',
                  });
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amaron"
                    value={editingBrand.name || ''}
                    onChange={(e) =>
                      setEditingBrand({
                        ...editingBrand,
                        name: e.target.value,
                        slug: editingBrand.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                    value={editingBrand.display_order ?? 1}
                    onChange={(e) =>
                      setEditingBrand({
                        ...editingBrand,
                        display_order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website / Destination URL
                </label>
                <input
                  type="url"
                  placeholder="https://www.amaron.in"
                  value={editingBrand.website || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Homepage Visibility Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show in Homepage Brands</span>
                  <span className="text-[11px] text-slate-500">
                    Display in the integrated brands row below categories
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBrand.is_channel_partner !== false}
                    onChange={(e) =>
                      setEditingBrand({
                        ...editingBrand,
                        is_channel_partner: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600" />
                </label>
              </div>

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
                  className="px-6 py-2.5 bg-[#0b1a30] hover:bg-sky-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Remove Brand Partnership?"
        message={`Are you sure you want to remove "${brandToDelete?.name}"?`}
        itemTitle={brandToDelete?.name}
        confirmLabel="Yes, Remove Brand"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setBrandToDelete(null);
        }}
      />
    </div>
  );
}
