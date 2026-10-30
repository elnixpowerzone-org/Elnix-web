'use client';

import React, { useState, useEffect } from 'react';
import { Tags, Plus, Edit, Trash2, X, FolderTree } from 'lucide-react';
import { Category } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'sonner';

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
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory({ ...cat });
    setIsModalOpen(true);
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
            STORE TAXONOMY
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Product Categories</h1>
          <p className="text-xs text-slate-500">
            Configure primary wholesale & retail categories displayed across the website.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden flex flex-col justify-between group"
          >
            <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
              <img
                src={cat.image_url}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 rounded-xl bg-white/90 hover:bg-white text-slate-700 shadow-md transition-transform active:scale-90"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setCategoryToDelete(cat);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md transition-transform active:scale-90"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-5 space-y-2">
              <h3 className="text-lg font-bold text-slate-900">{cat.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-400 border-t border-slate-100">
                <span>Slug: /{cat.slug}</span>
                {cat.product_count !== undefined && (
                  <span className="text-sky-600 font-bold">{cat.product_count} products</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
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
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <ImageUploader
                label="Category Cover Image (Cloudinary)"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solar & Renewable Power"
                  value={editingCategory.name || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Short overview of items in this category..."
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
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

