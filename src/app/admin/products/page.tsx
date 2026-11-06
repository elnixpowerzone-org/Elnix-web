'use client';

import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  X, 
  SlidersHorizontal,
  ExternalLink,
  Layers
} from 'lucide-react';
import { Product, Category, Brand } from '@/types';
import ImageUploader from '@/components/ImageUploader';
import ConfirmationModal from '@/components/ConfirmationModal';
import { toast } from 'sonner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Specifications key-value pairs editor state
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/brands').then(r => r.json()),
      ]);

      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      if (brandRes.success) setBrands(brandRes.data);
    } catch (err) {
      toast.error('Failed to load data', { description: 'Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      slug: '',
      category_id: categories[0]?.id || '',
      brand_id: brands[0]?.id || '',
      tagline: '',
      description: '',
      price: undefined,
      unit: 'Piece',
      image_url: '',
      public_id: '',
      in_stock: true,
      is_popular: false,
      is_featured: false,
    });
    setSpecs([
      { key: 'Warranty', value: '24 Months' },
      { key: 'Application', value: 'Residential & Commercial' }
    ]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct({ ...prod });
    const parsedSpecs = prod.specifications
      ? Object.entries(prod.specifications).map(([key, value]) => ({ key, value: String(value) }))
      : [];
    setSpecs(parsedSpecs);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.image_url) {
      toast.error('Missing required fields', {
        description: 'Product name and product image are required.',
      });
      return;
    }

    setIsSaving(true);
    const toastId = toast.loading('Saving product to database...');

    try {
      // Reassemble specifications object
      const specObj: Record<string, string> = {};
      specs.forEach(s => {
        if (s.key.trim()) {
          specObj[s.key.trim()] = s.value.trim();
        }
      });

      const payload = {
        ...editingProduct,
        specifications: specObj,
      };

      const isEdit = !!editingProduct.id;
      const url = isEdit ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(isEdit ? 'Product Updated!' : 'Product Created!', {
          id: toastId,
          description: `${payload.name} has been saved successfully.`,
        });
        setIsModalOpen(false);
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to save product');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error saving product';
      toast.error('Save failed', { id: toastId, description: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading('Deleting product and assets...');

    try {
      // If product has Cloudinary public_id, delete from Cloudinary
      if (productToDelete.public_id) {
        await fetch('/api/cloudinary/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ public_id: productToDelete.public_id }),
        });
      }

      // Delete from product database
      const res = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Product Deleted', {
          id: toastId,
          description: `${productToDelete.name} was removed from the store catalog.`,
        });
        setShowDeleteModal(false);
        setProductToDelete(null);
        fetchData();
      } else {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Delete failed';
      toast.error('Delete Error', { id: toastId, description: msg });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProducts = products.filter(p => {
    if (filterCategory !== 'all') {
      if (p.category_id !== filterCategory && p.category?.slug !== filterCategory) {
        return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider block">
            INVENTORY & CATALOG
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">Manage Products</h1>
          <p className="text-xs text-slate-500">
            Create, modify, and manage batteries, electricals, plumbing, and sanitary items.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0b1a30] hover:bg-sky-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4 text-sky-400" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by product title or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-400">
            Loading product catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No products found</p>
            <p className="text-xs text-slate-500">Try adjusting search filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Badges</th>
                  <th className="py-4 px-6">Stock</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">{p.tagline}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 font-bold text-[11px] border border-sky-100">
                        {p.category?.name || 'General'}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      {p.price ? (
                        <span>₹{p.price.toLocaleString('en-IN')} <span className="text-[10px] text-slate-400 font-normal">/{p.unit || 'pc'}</span></span>
                      ) : (
                        <span className="text-slate-400 font-normal italic">Quote basis</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex gap-1.5 flex-wrap">
                        {p.is_popular && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Popular
                          </span>
                        )}
                        {p.is_featured && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      {p.in_stock ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In Stock
                        </span>
                      ) : (
                        <span className="text-slate-400">Out of Stock</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-sky-600 hover:bg-slate-100 transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToDelete(p);
                            setShowDeleteModal(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Add / Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8">
            <div className="bg-[#0b1a30] text-white p-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest block">
                  {editingProduct.id ? 'EDIT PRODUCT RECORD' : 'CREATE NEW PRODUCT RECORD'}
                </span>
                <h3 className="text-xl font-black">
                  {editingProduct.id ? editingProduct.name : 'Add New Inventory Item'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Image Uploader with Drag & Drop + Browse Files */}
              <div>
                <ImageUploader
                  label="Product Featured Image (Stored in Cloudinary) *"
                  value={editingProduct.image_url}
                  publicId={editingProduct.public_id}
                  folder="elnix_products"
                  onChange={(url, publicId) => {
                    setEditingProduct({
                      ...editingProduct,
                      image_url: url,
                      public_id: publicId,
                    });
                  }}
                />
              </div>

              {/* Title & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Exide 150Ah Tubular Battery"
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Daily common requirement type"
                    value={editingProduct.tagline || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Category & Brand Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={editingProduct.category_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Brand
                  </label>
                  <select
                    value={editingProduct.brand_id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand_id: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="">No Brand Specified</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Price (₹ INR - Optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Leave empty for quote basis"
                    value={editingProduct.price || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    placeholder="Piece / Coil / Meter / Set"
                    value={editingProduct.unit || 'Piece'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>

              {/* Badges and Stock */}
              <div className="flex flex-wrap gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.in_stock ?? true}
                    onChange={(e) => setEditingProduct({ ...editingProduct, in_stock: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_popular ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_popular: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Show in Popular Products (Homepage Top 4)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                  />
                  <span>Featured Item</span>
                </label>
              </div>

              {/* Specifications Key-Value Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Technical Specifications
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpecs([...specs, { key: '', value: '' }])}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Feature (e.g. Capacity)"
                        value={item.key}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[index].key = e.target.value;
                          setSpecs(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. 150Ah / 12V)"
                        value={item.value}
                        onChange={(e) => {
                          const updated = [...specs];
                          updated[index].value = e.target.value;
                          setSpecs(updated);
                        }}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setSpecs(specs.filter((_, i) => i !== index))}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
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
                  {isSaving ? 'Saving Product...' : 'Save Product Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Delete Product Record?"
        message={`Are you sure you want to delete "${productToDelete?.name}"? Any attached Cloudinary images will also be purged.`}
        itemPreviewUrl={productToDelete?.image_url}
        itemTitle={productToDelete?.name}
        confirmLabel="Yes, Delete Product"
        isLoading={isDeleting}
        onConfirm={confirmDeleteProduct}
        onCancel={() => {
          setShowDeleteModal(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
}

