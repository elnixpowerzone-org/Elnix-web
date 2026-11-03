import { Category, Brand, Product, Enquiry, SiteSettings } from '@/types';
import { initialCategories, initialBrands, initialProducts, initialEnquiries, initialSiteSettings } from '@/data/initialData';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory / module-level state for demo/offline fallback mode
let categoriesStore: Category[] = [...initialCategories];
let brandsStore: Brand[] = [...initialBrands];
let productsStore: Product[] = [...initialProducts];
let enquiriesStore: Enquiry[] = [...initialEnquiries];
let settingsStore: SiteSettings = { ...initialSiteSettings };

// ---------------- PRODUCTS ----------------
export async function getProducts(options?: { category?: string; brand?: string; search?: string; featured?: boolean }) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      let query = adminClient
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .order('created_at', { ascending: false });

      if (options?.featured) {
        query = query.eq('is_featured', true);
      }
      if (options?.category) {
        query = query.eq('category_id', options.category);
      }
      if (options?.brand) {
        query = query.eq('brand_id', options.brand);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data as Product[];
      }
    } catch (err) {
      console.warn('Supabase product query error, falling back to local store:', err);
    }
  }

  // Local store fallback
  let list = [...productsStore].map(p => ({
    ...p,
    category: categoriesStore.find(c => c.id === p.category_id),
    brand: brandsStore.find(b => b.id === p.brand_id),
  }));

  if (options?.featured) {
    list = list.filter(p => p.is_featured);
  }
  if (options?.category) {
    list = list.filter(p => p.category_id === options.category || p.category?.slug === options.category);
  }
  if (options?.brand) {
    list = list.filter(p => p.brand_id === options.brand || p.brand?.slug === options.brand);
  }
  if (options?.search) {
    const s = options.search.toLowerCase();
    list = list.filter(p => 
      p.name.toLowerCase().includes(s) || 
      p.tagline.toLowerCase().includes(s) || 
      p.description.toLowerCase().includes(s)
    );
  }

  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('products')
        .select('*, category:categories(*), brand:brands(*)')
        .eq('slug', slug)
        .single();
      if (!error && data) {
        return data as Product;
      }
    } catch (err) {
      console.warn('Supabase product single error:', err);
    }
  }

  const found = productsStore.find(p => p.slug === slug || p.id === slug);
  if (!found) return null;

  return {
    ...found,
    category: categoriesStore.find(c => c.id === found.category_id),
    brand: brandsStore.find(b => b.id === found.brand_id),
  };
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const adminClient = createAdminClient();

  // If Supabase is connected
  if (adminClient) {
    try {
      if (product.id && !product.id.startsWith('prod-')) {
        const { data, error } = await adminClient
          .from('products')
          .update({
            name: product.name,
            slug: product.slug,
            category_id: product.category_id,
            brand_id: product.brand_id,
            tagline: product.tagline,
            description: product.description,
            price: product.price,
            unit: product.unit,
            image_url: product.image_url,
            public_id: product.public_id,
            gallery: product.gallery,
            gallery_public_ids: product.gallery_public_ids,
            specifications: product.specifications,
            is_featured: product.is_featured,
            is_popular: product.is_popular,
            in_stock: product.in_stock,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id)
          .select('*, category:categories(*), brand:brands(*)')
          .single();

        if (!error && data) return data as Product;
      } else {
        const { data, error } = await adminClient
          .from('products')
          .insert({
            name: product.name,
            slug: product.slug || `${(product.name || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
            category_id: product.category_id,
            brand_id: product.brand_id,
            tagline: product.tagline,
            description: product.description,
            price: product.price,
            unit: product.unit || 'Piece',
            image_url: product.image_url,
            public_id: product.public_id,
            gallery: product.gallery || [],
            gallery_public_ids: product.gallery_public_ids || [],
            specifications: product.specifications || {},
            is_featured: product.is_featured ?? false,
            is_popular: product.is_popular ?? true,
            in_stock: product.in_stock ?? true,
          })
          .select('*, category:categories(*), brand:brands(*)')
          .single();

        if (!error && data) return data as Product;
      }
    } catch (err) {
      console.warn('Supabase product save error:', err);
    }
  }

  // Fallback store update
  if (product.id) {
    const idx = productsStore.findIndex(p => p.id === product.id);
    if (idx !== -1) {
      productsStore[idx] = { ...productsStore[idx], ...product, updated_at: new Date().toISOString() };
      return productsStore[idx];
    }
  }

  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: product.name || 'Untitled Product',
    slug: product.slug || `${(product.name || 'item').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
    category_id: product.category_id || categoriesStore[0]?.id || '',
    brand_id: product.brand_id,
    tagline: product.tagline || '',
    description: product.description || '',
    price: product.price,
    unit: product.unit || 'Piece',
    image_url: product.image_url || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80',
    public_id: product.public_id,
    gallery: product.gallery || [],
    gallery_public_ids: product.gallery_public_ids || [],
    specifications: product.specifications || {},
    is_featured: product.is_featured ?? false,
    is_popular: product.is_popular ?? true,
    in_stock: product.in_stock ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  productsStore.unshift(newProduct);
  return newProduct;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const adminClient = createAdminClient();
  if (adminClient && !id.startsWith('prod-')) {
    try {
      const { error } = await adminClient.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase product delete error:', err);
    }
  }

  const idx = productsStore.findIndex(p => p.id === id);
  if (idx !== -1) {
    productsStore.splice(idx, 1);
    return true;
  }
  return false;
}

// ---------------- CATEGORY HELPERS & METADATA ----------------
export function autoInferCategoryIcon(nameOrSlug: string = ''): string {
  const s = nameOrSlug.toLowerCase();
  if (s.includes('batter')) return 'battery';
  if (s.includes('invert') || s.includes('ups')) return 'zap';
  if (s.includes('solar')) return 'sun';
  if (s.includes('pump')) return 'droplet';
  if (s.includes('heat') || s.includes('geyser') || s.includes('water-heater')) return 'flame';
  if (s.includes('elect')) return 'plug';
  if (s.includes('plumb') || s.includes('pipe')) return 'wrench';
  if (s.includes('sanit') || s.includes('bath')) return 'bath';
  return 'layers';
}

interface CategoryMetaRecord {
  is_visible?: boolean;
  custom_url?: string;
  icon?: string;
}

async function getHomepageCategoriesMeta(): Promise<Record<string, CategoryMetaRecord>> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'homepage_categories')
        .single();
      if (!error && data?.value && typeof data.value === 'object') {
        return (data.value.meta as Record<string, CategoryMetaRecord>) || {};
      }
    } catch {
      // Ignore error and return empty object
    }
  }
  return {};
}

async function saveHomepageCategoryMeta(identifier: string, meta: CategoryMetaRecord) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentMeta = await getHomepageCategoriesMeta();
      currentMeta[identifier] = {
        ...currentMeta[identifier],
        ...meta,
      };

      await adminClient
        .from('site_settings')
        .upsert({
          key: 'homepage_categories',
          value: { meta: currentMeta },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist category meta to site_settings:', err);
    }
  }
}

// ---------------- CATEGORIES ----------------
export async function getCategories(): Promise<Category[]> {
  const adminClient = createAdminClient();
  let rawCategories: Category[] = [];

  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        rawCategories = data as Category[];
      }
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }
  }

  if (rawCategories.length === 0) {
    rawCategories = [...categoriesStore];
  }

  // Load custom metadata (visibility, custom_url, icon) from site_settings
  const metaMap = await getHomepageCategoriesMeta();

  const enriched = rawCategories.map(cat => {
    const meta = metaMap[cat.id] || metaMap[cat.slug] || {};
    const icon = cat.icon || meta.icon || autoInferCategoryIcon(cat.slug || cat.name);
    const is_visible = cat.is_visible !== undefined ? cat.is_visible : (meta.is_visible !== undefined ? meta.is_visible : true);
    const custom_url = cat.custom_url || meta.custom_url || '';

    return {
      ...cat,
      display_order: cat.display_order ?? 0,
      is_visible,
      custom_url,
      icon,
      product_count: productsStore.filter(p => p.category_id === cat.id).length,
    };
  });

  // Sort ascending by display_order
  return enriched.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function saveCategory(category: Partial<Category>): Promise<Category> {
  const adminClient = createAdminClient();
  let savedCategory: Category | null = null;

  if (adminClient) {
    try {
      if (category.id && !category.id.startsWith('cat-')) {
        const { data, error } = await adminClient
          .from('categories')
          .update({
            name: category.name,
            slug: category.slug,
            description: category.description,
            image_url: category.image_url,
            public_id: category.public_id,
            display_order: category.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', category.id)
          .select()
          .single();

        if (!error && data) {
          savedCategory = data as Category;
        }
      } else {
        const generatedSlug = category.slug || `${(category.name || 'cat').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
        const { data, error } = await adminClient
          .from('categories')
          .insert({
            name: category.name || 'New Category',
            slug: generatedSlug,
            description: category.description || '',
            image_url: category.image_url || '/images/cat-batteries.jpg',
            public_id: category.public_id || null,
            display_order: category.display_order ?? (categoriesStore.length + 1),
          })
          .select()
          .single();

        if (!error && data) {
          savedCategory = data as Category;
        }
      }
    } catch (err) {
      console.warn('Supabase category save error:', err);
    }
  }

  // Update in-memory fallback
  if (category.id) {
    const idx = categoriesStore.findIndex(c => c.id === category.id);
    if (idx !== -1) {
      categoriesStore[idx] = {
        ...categoriesStore[idx],
        ...category,
        display_order: category.display_order ?? categoriesStore[idx].display_order,
      };
      savedCategory = savedCategory || categoriesStore[idx];
    }
  }

  if (!savedCategory) {
    const newCat: Category = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || 'New Category',
      slug: category.slug || `${(category.name || 'cat').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      description: category.description || '',
      image_url: category.image_url || '/images/cat-batteries.jpg',
      public_id: category.public_id,
      display_order: category.display_order ?? (categoriesStore.length + 1),
      product_count: 0,
      is_visible: category.is_visible ?? true,
      custom_url: category.custom_url || '',
      icon: category.icon || autoInferCategoryIcon(category.name),
    };
    categoriesStore.push(newCat);
    savedCategory = newCat;
  }

  // Save metadata (is_visible, custom_url, icon) to site_settings
  const metaId = savedCategory.id || savedCategory.slug;
  if (metaId) {
    await saveHomepageCategoryMeta(metaId, {
      is_visible: category.is_visible ?? true,
      custom_url: category.custom_url || '',
      icon: category.icon || autoInferCategoryIcon(savedCategory.slug || savedCategory.name),
    });
  }

  return {
    ...savedCategory,
    is_visible: category.is_visible ?? true,
    custom_url: category.custom_url || '',
    icon: category.icon || autoInferCategoryIcon(savedCategory.slug || savedCategory.name),
  };
}

export async function deleteCategory(id: string): Promise<boolean> {
  const adminClient = createAdminClient();
  if (adminClient && !id.startsWith('cat-')) {
    try {
      const { error } = await adminClient.from('categories').delete().eq('id', id);
      if (!error) {
        // also clean up meta
        saveHomepageCategoryMeta(id, { is_visible: false });
        return true;
      }
    } catch (err) {
      console.warn('Supabase category delete error:', err);
    }
  }

  const idx = categoriesStore.findIndex(c => c.id === id);
  if (idx !== -1) {
    categoriesStore.splice(idx, 1);
    return true;
  }
  return false;
}

// ---------------- BRANDS ----------------
export async function getBrands(): Promise<Brand[]> {
  const adminClient = createAdminClient();
  let rawBrands: Brand[] = [];

  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        rawBrands = data as Brand[];
      }
    } catch (err) {
      console.warn('Supabase brands error:', err);
    }
  }

  if (rawBrands.length === 0) {
    rawBrands = [...brandsStore];
  }

  return rawBrands.map(b => ({
    ...b,
    is_channel_partner: b.is_channel_partner ?? true,
    display_order: b.display_order ?? 0,
  })).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function saveBrand(brand: Partial<Brand>): Promise<Brand> {
  const adminClient = createAdminClient();
  let savedBrand: Brand | null = null;

  if (adminClient) {
    try {
      if (brand.id && !brand.id.startsWith('brand-')) {
        const { data, error } = await adminClient
          .from('brands')
          .update({
            name: brand.name,
            slug: brand.slug,
            logo_url: brand.logo_url,
            public_id: brand.public_id,
            website: brand.website,
            is_channel_partner: brand.is_channel_partner ?? true,
            display_order: brand.display_order,
          })
          .eq('id', brand.id)
          .select()
          .single();
        if (!error && data) savedBrand = data as Brand;
      } else {
        const generatedSlug = brand.slug || `${(brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
        const { data, error } = await adminClient
          .from('brands')
          .insert({
            name: brand.name || 'New Brand',
            slug: generatedSlug,
            logo_url: brand.logo_url || 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=300&q=80',
            public_id: brand.public_id || null,
            website: brand.website || null,
            is_channel_partner: brand.is_channel_partner ?? true,
            display_order: brand.display_order ?? (brandsStore.length + 1),
          })
          .select()
          .single();
        if (!error && data) savedBrand = data as Brand;
      }
    } catch (err) {
      console.warn('Supabase brand save error:', err);
    }
  }

  if (brand.id) {
    const idx = brandsStore.findIndex(b => b.id === brand.id);
    if (idx !== -1) {
      brandsStore[idx] = { ...brandsStore[idx], ...brand };
      return savedBrand || brandsStore[idx];
    }
  }

  if (!savedBrand) {
    const newBrand: Brand = {
      id: brand.id || `brand-${Date.now()}`,
      name: brand.name || 'New Brand',
      slug: brand.slug || `${(brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      logo_url: brand.logo_url || 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=300&q=80',
      public_id: brand.public_id,
      website: brand.website,
      is_channel_partner: brand.is_channel_partner ?? true,
      display_order: brand.display_order ?? (brandsStore.length + 1),
    };
    brandsStore.push(newBrand);
    return newBrand;
  }

  return savedBrand;
}

export async function deleteBrand(id: string): Promise<boolean> {
  const adminClient = createAdminClient();
  if (adminClient && !id.startsWith('brand-')) {
    try {
      const { error } = await adminClient.from('brands').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase brand delete error:', err);
    }
  }
  const idx = brandsStore.findIndex(b => b.id === id);
  if (idx !== -1) {
    brandsStore.splice(idx, 1);
    return true;
  }
  return false;
}

// ---------------- ENQUIRIES ----------------
export async function getEnquiries(): Promise<Enquiry[]> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('enquiries')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data as Enquiry[];
    } catch (err) {
      console.warn('Supabase enquiries error:', err);
    }
  }
  return enquiriesStore;
}

export async function createEnquiry(enquiry: Omit<Enquiry, 'id' | 'created_at'>): Promise<Enquiry> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('enquiries')
        .insert({
          name: enquiry.name,
          phone: enquiry.phone,
          email: enquiry.email,
          type: enquiry.type || 'general',
          category: enquiry.category,
          product_name: enquiry.product_name,
          message: enquiry.message,
          status: 'pending',
        })
        .select()
        .single();
      if (!error && data) return data as Enquiry;
    } catch (err) {
      console.warn('Supabase create enquiry error:', err);
    }
  }

  const newEnq: Enquiry = {
    id: `enq-${Date.now()}`,
    ...enquiry,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  enquiriesStore.unshift(newEnq);
  return newEnq;
}

export async function updateEnquiryStatus(id: string, status: Enquiry['status'], notes?: string): Promise<boolean> {
  const adminClient = createAdminClient();
  if (adminClient && !id.startsWith('enq-')) {
    try {
      const { error } = await adminClient
        .from('enquiries')
        .update({ status, notes, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase enquiry update error:', err);
    }
  }

  const enq = enquiriesStore.find(e => e.id === id);
  if (enq) {
    enq.status = status;
    if (notes !== undefined) enq.notes = notes;
    return true;
  }
  return false;
}

// ---------------- SITE SETTINGS ----------------
export async function getSiteSettings(): Promise<SiteSettings> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'store_info')
        .single();
      if (!error && data?.value) return data.value as SiteSettings;
    } catch (err) {
      console.warn('Supabase site settings error:', err);
    }
  }
  return settingsStore;
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
  const adminClient = createAdminClient();
  const updated = { ...settingsStore, ...settings };
  if (adminClient) {
    try {
      await adminClient
        .from('site_settings')
        .upsert({ key: 'store_info', value: updated, updated_at: new Date().toISOString() });
    } catch (err) {
      console.warn('Supabase settings update error:', err);
    }
  }
  settingsStore = updated;
  return settingsStore;
}
