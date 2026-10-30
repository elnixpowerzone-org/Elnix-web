'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit, Trash2, X, Globe } from 'lucide-react';
import { Brand } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'sonner';

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

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand({ ...brand });
    setIsModalOpen(true);
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

      const res = await fetch(`/api/brands?id=${brandToDelete.id}`, {
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
          <p className="text-xs text-slate-500">
            Manage partner logos and affiliations displayed on the homepage and catalog filter.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {brands.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-4 flex flex-col justify-between group"
          >
            <div className="aspect-3/2 w-full rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2 mb-3">
              <span className="text-base font-black text-slate-800 tracking-tight text-center">
                {b.name}
              </span>
            </div>

            <div className="text-center">
              <div className="text-xs font-bold text-slate-900">{b.name}</div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Partner #{b.display_order || 1}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
              <button
                onClick={() => handleOpenEdit(b)}
                className="p-1.5 text-slate-500 hover:text-sky-600 rounded-lg hover:bg-slate-100"
                title="Edit"
              >
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setBrandToDelete(b);
                  setShowDeleteModal(true);
                }}
                className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Brand Modal */}
      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
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
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <ImageUploader
                label="Brand Logo (Cloudinary)"
                value={editingBrand.logo_url}
                publicId={editingBrand.public_id}
                folder="elnix_brands"
                onChange={(url, publicId) => {
                  setEditingBrand({
                    ...editingBrand,
                    logo_url: url,
                    public_id: publicId,
                  });
                }}
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Havells / Legrand"
                  value={editingBrand.name || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editingBrand.website || ''}
                  onChange={(e) => setEditingBrand({ ...editingBrand, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
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

