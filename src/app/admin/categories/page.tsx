'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Eye, EyeOff, ExternalLink, Sparkles } from 'lucide-react';
import { Category } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import ConfirmationModal from '@/components/ConfirmationModal';
import CategoryIcon from '@/components/home/CategoryIcon';
import { toast } from 'sonner';

const ICON_OPTIONS = [
  { value: 'battery', label: 'Battery (Automotive / Inverter)' },
  { value: 'zap', label: 'Lightning / Inverter / UPS' },
  { value: 'sun', label: 'Sun / Solar Panels' },
  { value: 'droplet', label: 'Water Droplet / Pumps' },
  { value: 'flame', label: 'Flame / Water Heaters' },
  { value: 'plug', label: 'Plug / Electricals' },
  { value: 'wrench', label: 'Wrench / Plumbing' },
  { value: 'bath', label: 'Bath / Sanitary' },
  { value: 'layers', label: 'Layers / General' },
];

const PRESETS = [
  { name: 'Batteries', description: 'Automotive, inverter and industrial batteries.', icon: 'battery', image_url: '/images/cat-batteries.jpg' },
  { name: 'Inverters', description: 'Home inverters, UPS and power backup solutions.', icon: 'zap', image_url: '/images/prod-inverter-battery.jpg' },
  { name: 'Solar', description: 'Solar panels and complete solar power solutions.', icon: 'sun', image_url: '/images/prod-solar-inverter.jpg' },
  { name: 'Pumps', description: 'Water pumps and pumping solutions.', icon: 'droplet', image_url: '/images/cat-plumbing.jpg' },
  { name: 'Water Heaters', description: 'Modern and efficient water heating solutions.', icon: 'flame', image_url: '/images/cat-sanitary.jpg' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setEditingCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      public_id: '',
      display_order: categories.length + 1,
      is_visible: true,
      custom_url: '',
      icon: 'layers',
    });
    setIsModalOpen(true);
  };

  const handleApplyPreset = (preset: typeof PRESETS[0]) => {
    setEditingCategory({
      name: preset.name,
      slug: preset.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: preset.description,
      image_url: preset.image_url,
      public_id: '',
      display_order: categories.length + 1,
      is_visible: true,
      custom_url: '',
      icon: preset.icon,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({
      ...cat,
      is_visible: cat.is_visible !== false,
      display_order: cat.display_order ?? 1,
      custom_url: cat.custom_url || '',
      icon: cat.icon || 'layers',
    });
    setIsModalOpen(true);
  };

  const handleToggleVisibility = async (cat: Category) => {
    const updatedVisible = cat.is_visible === false ? true : false;
    const toastId = toast.loading(`${updatedVisible ? 'Enabling' : 'Hiding'} ${cat.name}...`);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cat,
          is_visible: updatedVisible,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`${cat.name} is now ${updatedVisible ? 'visible on homepage' : 'hidden from homepage'}`, { id: toastId });
        fetchCategories();
      } else {
        throw new Error(data.error || 'Failed to update visibility');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Failed to update visibility', { id: toastId, description: msg });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) {
      toast.error('Category name is required');
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving category...');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Category Saved!', {
          id: toastId,
          description: `${editingCategory.name} was successfully updated.`,
        });
        setIsModalOpen(false);
        fetchCategories();
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      toast.error('Failed to save category', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting category...');

    try {
      if (categoryToDelete.public_id) {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: categoryToDelete.public_id }),
        });
      }

      const res = await fetch(`/api/categories?id=${categoryToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Category Deleted', {
          id: toastId,
          description: `${categoryToDelete.name} was deleted.`,
        });
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        fetchCategories();
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
            STORE TAXONOMY &amp; HOMEPAGE CATEGORIES
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Product Categories</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Manage category cards, custom images, descriptions, ordering, homepage visibility, and icons.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-center shrink-0"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Quick Add Presets Bar */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center gap-2.5">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Quick Presets:</span>
        </div>
        {PRESETS.map((p) => {
          const alreadyExists = categories.some((c) => c.name.toLowerCase() === p.name.toLowerCase());
          return (
            <button
              key={p.name}
              type="button"
              disabled={alreadyExists}
              onClick={() => handleApplyPreset(p)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-sky-300 text-xs font-bold text-slate-700 hover:text-sky-600 disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <CategoryIcon icon={p.icon} name={p.name} className="w-3.5 h-3.5 text-sky-600" />
              <span>{p.name}</span>
              {alreadyExists ? <span className="text-[10px] text-slate-400 font-normal">(Added)</span> : <span className="text-sky-600 font-black">+</span>}
            </button>
          );
        })}
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-sm font-medium text-slate-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const isVisible = cat.is_visible !== false;

            return (
              <div
                key={cat.id}
                className={`bg-white rounded-3xl border transition-all duration-200 shadow-md overflow-hidden flex flex-col justify-between group ${
                  isVisible ? 'border-slate-200/90' : 'border-dashed border-slate-300 opacity-75'
                }`}
              >
                {/* Image Area */}
                <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                      #{cat.display_order ?? 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-1 cursor-pointer ${
                        isVisible
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                          : 'bg-slate-700 text-slate-200 hover:bg-slate-800'
                      }`}
                      title={isVisible ? 'Click to hide from homepage' : 'Click to show on homepage'}
                    >
                      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{isVisible ? 'Visible' : 'Hidden'}</span>
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md transition-transform active:scale-90 cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md transition-transform active:scale-90 cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <CategoryIcon icon={cat.icon} name={cat.name} className="w-5 h-5 text-sky-600 shrink-0" />
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed min-h-[32px]">
                    {cat.description || 'No description provided.'}
                  </p>

                  <div className="pt-3 flex flex-col gap-1 text-[11px] font-medium text-slate-400 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span>Slug: /{cat.slug}</span>
                      {cat.product_count !== undefined && (
                        <span className="text-sky-600 font-bold">{cat.product_count} products</span>
                      )}
                    </div>
                    {cat.custom_url && (
                      <div className="flex items-center gap-1 text-slate-500 truncate">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate">{cat.custom_url}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-[#0b1a30] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">
                  CATEGORY MANAGEMENT
                </span>
                <h3 className="text-xl font-black">
                  {editingCategory.id ? 'Edit Category' : 'Create New Category'}
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
                label="Category Cover Image (Cloudinary or URL)"
                value={editingCategory.image_url}
                publicId={editingCategory.public_id}
                folder="elnix_categories"
                onChange={(url, publicId) => {
                  setEditingCategory({
                    ...editingCategory,
                    image_url: url,
                    public_id: publicId,
                  });
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inverters"
                    value={editingCategory.name || ''}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        name: e.target.value,
                        slug: editingCategory.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. inverters"
                    value={editingCategory.slug || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Home inverters, UPS and power backup solutions."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category Icon
                  </label>
                  <select
                    value={editingCategory.icon || 'layers'}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={editingCategory.display_order ?? 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        display_order: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Custom Destination Link (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Defaults to /products?category=slug"
                  value={editingCategory.custom_url || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, custom_url: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Homepage Visibility Toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/90 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show on Homepage</span>
                  <span className="text-[11px] text-slate-500">
                    Display this card in the homepage categories row
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCategory.is_visible !== false}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        is_visible: e.target.checked,
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
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Category?"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"?`}
        itemPreviewUrl={categoryToDelete?.image_url}
        itemTitle={categoryToDelete?.name}
        confirmLabel="Yes, Delete Category"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}
