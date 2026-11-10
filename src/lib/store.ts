import { Category, Brand, Product, Enquiry, SiteSettings, HeroSettings, StoreLocation } from '@/types';
import { initialCategories, initialBrands, initialProducts, initialEnquiries, initialSiteSettings, initialHeroSettings, initialStoreLocations } from '@/data/initialData';
import { createAdminClient } from '@/lib/supabase/admin';

// In-memory / module-level state for demo/offline fallback mode
let categoriesStore: Category[] = [...initialCategories];
let brandsStore: Brand[] = [...initialBrands];
let productsStore: Product[] = [...initialProducts];
let enquiriesStore: Enquiry[] = [...initialEnquiries];
let settingsStore: SiteSettings = { ...initialSiteSettings };
let heroSettingsStore: HeroSettings = { ...initialHeroSettings };
let locationsStore: StoreLocation[] = [...initialStoreLocations];

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

// In-memory set for fast local deletion tracking
const localDeletedCategoryKeys = new Set<string>();

async function getDeletedCategoryKeys(): Promise<Set<string>> {
  const result = new Set<string>(localDeletedCategoryKeys);
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'deleted_categories')
        .single();
      if (!error && data?.value && Array.isArray((data.value as { keys?: string[] }).keys)) {
        for (const k of (data.value as { keys: string[] }).keys) {
          result.add(String(k).toLowerCase());
        }
      }
    } catch {
      // Ignore
    }
  }
  return result;
}

async function markCategoryAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedCategoryKeys.add(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedCategoryKeys();
      for (const k of keys) {
        if (k) currentKeys.add(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_categories',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist deleted category key:', err);
    }
  }
}

async function unmarkCategoryAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedCategoryKeys.delete(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedCategoryKeys();
      for (const k of keys) {
        if (k) currentKeys.delete(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_categories',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to unmark deleted category key:', err);
    }
  }
}

async function getCustomCategories(): Promise<Category[]> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'custom_categories')
        .single();
      if (!error && data?.value && Array.isArray((data.value as { categories?: Category[] }).categories)) {
        return (data.value as { categories: Category[] }).categories;
      }
    } catch {
      // Ignore
    }
  }
  return [];
}

async function saveCustomCategoryToSettings(category: Category) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const list = await getCustomCategories();
      const idx = list.findIndex(c => c.id === category.id || c.slug === category.slug);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...category };
      } else {
        list.push(category);
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'custom_categories',
          value: { categories: list },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist custom category to site_settings:', err);
    }
  }
}

async function removeCustomCategoryFromSettings(idOrSlug: string) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const list = await getCustomCategories();
      const filtered = list.filter(c => c.id !== idOrSlug && c.slug !== idOrSlug);
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'custom_categories',
          value: { categories: filtered },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to remove custom category from site_settings:', err);
    }
  }
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
        return ((data.value as { meta?: Record<string, CategoryMetaRecord> }).meta) || {};
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
      const norm = identifier.toLowerCase();
      currentMeta[norm] = {
        ...currentMeta[norm],
        ...meta,
      };
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
  let supabaseCategories: Category[] = [];

  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        supabaseCategories = data as Category[];
      }
    } catch (err) {
      console.warn('Supabase categories error:', err);
    }
  }

  // Load deleted keys, custom categories, and homepage meta from site_settings
  const [deletedKeys, customCategories, metaMap] = await Promise.all([
    getDeletedCategoryKeys(),
    getCustomCategories(),
    getHomepageCategoriesMeta(),
  ]);

  // Combine categories: initial presets + Supabase rows + custom categories + memory store
  const categoryMap = new Map<string, Category>();

  // 1. Initial presets
  for (const cat of initialCategories) {
    categoryMap.set(cat.slug, { ...cat });
  }

  // 2. Supabase categories (overlays presets)
  for (const cat of supabaseCategories) {
    const key = cat.slug || cat.id;
    categoryMap.set(key, { ...(categoryMap.get(key) || {}), ...cat });
  }

  // 3. Custom categories in site_settings
  for (const cat of customCategories) {
    const key = cat.slug || cat.id;
    categoryMap.set(key, { ...(categoryMap.get(key) || {}), ...cat });
  }

  // 4. Memory store
  for (const cat of categoriesStore) {
    const key = cat.slug || cat.id;
    if (categoryMap.has(key)) {
      categoryMap.set(key, { ...categoryMap.get(key)!, ...cat });
    } else {
      categoryMap.set(key, { ...cat });
    }
  }

  // Filter out ANY category that has been marked as deleted
  const filteredCategories: Category[] = [];
  for (const cat of Array.from(categoryMap.values())) {
    const isDeleted =
      (cat.id && deletedKeys.has(cat.id.toLowerCase())) ||
      (cat.slug && deletedKeys.has(cat.slug.toLowerCase())) ||
      (cat.name && deletedKeys.has(cat.name.toLowerCase()));

    if (!isDeleted) {
      filteredCategories.push(cat);
    }
  }

  // Enrich with metadata (icon, visibility, custom_url, product count)
  // CRITICAL: meta.is_visible (saved in Supabase site_settings) takes precedence over defaults!
  const enriched = filteredCategories.map(cat => {
    const meta =
      (cat.id && metaMap[cat.id.toLowerCase()]) ||
      (cat.id && metaMap[cat.id]) ||
      (cat.slug && metaMap[cat.slug.toLowerCase()]) ||
      (cat.slug && metaMap[cat.slug]) ||
      (cat.name && metaMap[cat.name.toLowerCase()]) ||
      {};

    const icon = meta.icon || cat.icon || autoInferCategoryIcon(cat.slug || cat.name);
    const is_visible = meta.is_visible !== undefined
      ? meta.is_visible
      : (cat.is_visible !== undefined ? cat.is_visible : true);
    const custom_url = meta.custom_url !== undefined ? meta.custom_url : (cat.custom_url || '');

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
  const targetSlug = category.slug || `${(category.name || 'cat').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Unmark from deleted list if re-saving or re-adding
  await unmarkCategoryAsDeleted([
    category.id || '',
    targetSlug,
    category.name || '',
  ]);

  if (adminClient) {
    try {
      const isUUID = !!(category.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category.id));

      if (isUUID) {
        const { data, error } = await adminClient
          .from('categories')
          .update({
            name: category.name,
            slug: targetSlug,
            description: category.description,
            image_url: category.image_url,
            public_id: category.public_id,
            display_order: category.display_order,
            updated_at: new Date().toISOString(),
          })
          .eq('id', category.id!)
          .select()
          .single();

        if (!error && data) {
          savedCategory = data as Category;
        }
      } else {
        const { data, error } = await adminClient
          .from('categories')
          .upsert({
            name: category.name || 'New Category',
            slug: targetSlug,
            description: category.description || '',
            image_url: category.image_url || '/images/cat-batteries.jpg',
            public_id: category.public_id || null,
            display_order: category.display_order ?? (categoriesStore.length + 1),
          }, { onConflict: 'slug' })
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

  // Fallback category representation
  if (!savedCategory) {
    savedCategory = {
      id: category.id || `cat-${targetSlug}`,
      name: category.name || 'New Category',
      slug: targetSlug,
      description: category.description || '',
      image_url: category.image_url || '/images/cat-batteries.jpg',
      public_id: category.public_id,
      display_order: category.display_order ?? (categoriesStore.length + 1),
      product_count: 0,
      is_visible: category.is_visible ?? true,
      custom_url: category.custom_url || '',
      icon: category.icon || autoInferCategoryIcon(category.name || targetSlug),
    };
  }

  // Update in-memory store
  const existingIdx = categoriesStore.findIndex(c => c.id === savedCategory!.id || c.slug === savedCategory!.slug);
  if (existingIdx !== -1) {
    categoriesStore[existingIdx] = {
      ...categoriesStore[existingIdx],
      ...savedCategory,
      ...category,
    };
  } else {
    categoriesStore.push({ ...savedCategory, ...category });
  }

  // Save to persistent custom_categories in site_settings
  await saveCustomCategoryToSettings({
    ...savedCategory,
    ...category,
    is_visible: category.is_visible ?? true,
    custom_url: category.custom_url || '',
    icon: category.icon || autoInferCategoryIcon(savedCategory.name || savedCategory.slug),
  });

  // Save metadata to site_settings under all identifiers (id, slug, targetSlug)
  const metaUpdates = {
    is_visible: category.is_visible !== undefined ? category.is_visible : true,
    custom_url: category.custom_url || '',
    icon: category.icon || autoInferCategoryIcon(savedCategory.slug || savedCategory.name),
  };

  const idKeys = Array.from(new Set([savedCategory.id, savedCategory.slug, targetSlug].filter(Boolean)));
  for (const k of idKeys) {
    await saveHomepageCategoryMeta(k, metaUpdates);
  }

  return {
    ...savedCategory,
    is_visible: category.is_visible ?? true,
    custom_url: category.custom_url || '',
    icon: category.icon || autoInferCategoryIcon(savedCategory.slug || savedCategory.name),
  };
}

export async function deleteCategory(id: string, extra?: { slug?: string; name?: string }): Promise<boolean> {
  const adminClient = createAdminClient();
  const slug = extra?.slug || '';
  const name = extra?.name || '';

  // 1. Mark in persistent deleted list immediately so it never resurrects
  await markCategoryAsDeleted([id, slug, name]);

  // 2. Also mark as hidden in meta
  if (id) await saveHomepageCategoryMeta(id, { is_visible: false });
  if (slug) await saveHomepageCategoryMeta(slug, { is_visible: false });

  // 3. Remove from custom_categories in site_settings
  await removeCustomCategoryFromSettings(id);
  if (slug) await removeCustomCategoryFromSettings(slug);

  // 4. Try deleting from Supabase
  if (adminClient) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await adminClient.from('categories').delete().eq('id', id);
      }
      if (slug) {
        await adminClient.from('categories').delete().eq('slug', slug);
      }
    } catch (err) {
      console.warn('Supabase category delete attempt:', err);
    }
  }

  // 5. Remove from in-memory fallback store
  categoriesStore = categoriesStore.filter(c => c.id !== id && c.slug !== id && (!slug || c.slug !== slug));

  return true;
}

// ---------------- BRAND HELPERS & PERSISTENCE ----------------
const localDeletedBrandKeys = new Set<string>();

async function getDeletedBrandKeys(): Promise<Set<string>> {
  const result = new Set<string>(localDeletedBrandKeys);
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'deleted_brands')
        .single();
      if (!error && data?.value && Array.isArray((data.value as { keys?: string[] }).keys)) {
        for (const k of (data.value as { keys: string[] }).keys) {
          result.add(String(k).toLowerCase());
        }
      }
    } catch {
      // Ignore
    }
  }
  return result;
}

async function markBrandAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedBrandKeys.add(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedBrandKeys();
      for (const k of keys) {
        if (k) currentKeys.add(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_brands',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist deleted brand key:', err);
    }
  }
}

async function unmarkBrandAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedBrandKeys.delete(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedBrandKeys();
      for (const k of keys) {
        if (k) currentKeys.delete(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_brands',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to unmark deleted brand key:', err);
    }
  }
}

async function getBrandOverrides(): Promise<Record<string, Partial<Brand>>> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'brand_overrides')
        .single();
      if (!error && data?.value && typeof data.value === 'object') {
        return (data.value as { overrides?: Record<string, Partial<Brand>> }).overrides || {};
      }
    } catch {
      // Ignore
    }
  }
  return {};
}

async function saveBrandOverride(identifiers: string[], updates: Partial<Brand>) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentMap = await getBrandOverrides();
      for (const id of identifiers) {
        if (!id) continue;
        const norm = id.toLowerCase();
        currentMap[norm] = {
          ...currentMap[norm],
          ...updates,
        };
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'brand_overrides',
          value: { overrides: currentMap },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist brand overrides to site_settings:', err);
    }
  }
}

async function removeBrandOverride(identifiers: string[]) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentMap = await getBrandOverrides();
      for (const id of identifiers) {
        if (!id) continue;
        delete currentMap[id.toLowerCase()];
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'brand_overrides',
          value: { overrides: currentMap },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to remove brand override:', err);
    }
  }
}

async function getCustomBrands(): Promise<Brand[]> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'custom_brands')
        .single();
      if (!error && data?.value && Array.isArray((data.value as { brands?: Brand[] }).brands)) {
        return (data.value as { brands: Brand[] }).brands;
      }
    } catch {
      // Ignore
    }
  }
  return [];
}

async function saveCustomBrandToSettings(brand: Brand) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const list = await getCustomBrands();
      const idx = list.findIndex(b => b.id === brand.id || b.slug === brand.slug);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...brand };
      } else {
        list.push(brand);
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'custom_brands',
          value: { brands: list },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist custom brand to site_settings:', err);
    }
  }
}

async function removeCustomBrandFromSettings(idOrSlug: string) {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const list = await getCustomBrands();
      const filtered = list.filter(b => b.id !== idOrSlug && b.slug !== idOrSlug);
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'custom_brands',
          value: { brands: filtered },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to remove custom brand from site_settings:', err);
    }
  }
}

// ---------------- BRANDS ----------------
export async function getBrands(): Promise<Brand[]> {
  const adminClient = createAdminClient();
  let supabaseBrands: Brand[] = [];

  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('brands')
        .select('*')
        .order('display_order', { ascending: true });
      if (!error && data) {
        supabaseBrands = data as Brand[];
      }
    } catch (err) {
      console.warn('Supabase brands error:', err);
    }
  }

  // Load deleted keys, custom brands, and persistent overrides from Supabase site_settings
  const [deletedKeys, customBrands, overridesMap] = await Promise.all([
    getDeletedBrandKeys(),
    getCustomBrands(),
    getBrandOverrides(),
  ]);

  const brandMap = new Map<string, Brand>();

  // 1. Initial presets (provides presets like Amaron, Exide, Racold, etc.)
  for (const b of initialBrands) {
    brandMap.set(b.slug, { ...b });
  }

  // 2. Supabase brands (overlays initial presets)
  for (const b of supabaseBrands) {
    const key = b.slug || b.id;
    brandMap.set(key, { ...(brandMap.get(key) || {}), ...b });
  }

  // 3. Custom brands in site_settings
  for (const b of customBrands) {
    const key = b.slug || b.id;
    brandMap.set(key, { ...(brandMap.get(key) || {}), ...b });
  }

  // 4. Memory store
  for (const b of brandsStore) {
    const key = b.slug || b.id;
    if (brandMap.has(key)) {
      brandMap.set(key, { ...brandMap.get(key)!, ...b });
    } else {
      brandMap.set(key, { ...b });
    }
  }

  // Filter out ANY brand that has been marked as deleted
  const activeBrands: Brand[] = [];
  for (const b of Array.from(brandMap.values())) {
    const isDeleted =
      (b.id && deletedKeys.has(b.id.toLowerCase())) ||
      (b.slug && deletedKeys.has(b.slug.toLowerCase())) ||
      (b.name && deletedKeys.has(b.name.toLowerCase()));

    if (!isDeleted) {
      activeBrands.push(b);
    }
  }

  // Enrich with overrides from site_settings (ensures newly saved logos, visibility toggles & ordering win)
  const enriched = activeBrands.map(b => {
    const override =
      (b.id && overridesMap[b.id.toLowerCase()]) ||
      (b.slug && overridesMap[b.slug.toLowerCase()]) ||
      (b.name && overridesMap[b.name.toLowerCase()]) ||
      {};

    return {
      ...b,
      ...override,
      is_channel_partner: override.is_channel_partner !== undefined
        ? override.is_channel_partner
        : (b.is_channel_partner !== undefined ? b.is_channel_partner : true),
      display_order: override.display_order ?? b.display_order ?? 0,
      logo_url: override.logo_url || b.logo_url || '',
      public_id: override.public_id !== undefined ? override.public_id : b.public_id,
      website: override.website !== undefined ? override.website : (b.website || ''),
    };
  });

  return enriched.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function saveBrand(brand: Partial<Brand>): Promise<Brand> {
  const adminClient = createAdminClient();
  let savedBrand: Brand | null = null;
  const targetSlug = brand.slug || `${(brand.name || 'brand').toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Unmark from deleted list
  await unmarkBrandAsDeleted([brand.id || '', targetSlug, brand.name || '']);

  // Attempt Supabase direct brands table update/insert
  if (adminClient) {
    try {
      const isUUID = !!(brand.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(brand.id));
      if (isUUID) {
        const { data, error } = await adminClient
          .from('brands')
          .update({
            name: brand.name,
            slug: targetSlug,
            logo_url: brand.logo_url,
            public_id: brand.public_id,
            website: brand.website,
            is_channel_partner: brand.is_channel_partner !== false,
            display_order: brand.display_order,
          })
          .eq('id', brand.id!)
          .select()
          .single();
        if (!error && data) savedBrand = data as Brand;
      } else {
        const { data, error } = await adminClient
          .from('brands')
          .upsert({
            name: brand.name || 'New Brand',
            slug: targetSlug,
            logo_url: brand.logo_url || '',
            public_id: brand.public_id || null,
            website: brand.website || null,
            is_channel_partner: brand.is_channel_partner !== false,
            display_order: brand.display_order ?? (brandsStore.length + 1),
          }, { onConflict: 'slug' })
          .select()
          .single();
        if (!error && data) savedBrand = data as Brand;
      }
    } catch (err) {
      console.warn('Supabase brands table update attempt:', err);
    }
  }

  // Construct guaranteed valid brand object
  const finalBrand: Brand = {
    id: savedBrand?.id || brand.id || `brand-${targetSlug}`,
    name: brand.name || savedBrand?.name || 'New Brand',
    slug: targetSlug,
    logo_url: brand.logo_url !== undefined ? brand.logo_url : (savedBrand?.logo_url || ''),
    public_id: brand.public_id !== undefined ? brand.public_id : savedBrand?.public_id,
    website: brand.website !== undefined ? brand.website : savedBrand?.website,
    is_channel_partner: brand.is_channel_partner !== false,
    display_order: brand.display_order ?? savedBrand?.display_order ?? (brandsStore.length + 1),
  };

  // Update in-memory store
  const existingIdx = brandsStore.findIndex(b => b.id === finalBrand.id || b.slug === finalBrand.slug);
  if (existingIdx !== -1) {
    brandsStore[existingIdx] = { ...brandsStore[existingIdx], ...finalBrand };
  } else {
    brandsStore.push(finalBrand);
  }

  // ALWAYS persist to Supabase site_settings (custom_brands & brand_overrides)
  // This guarantees persistence even if the publishable key encounters RLS restrictions on the brands table!
  const identifiers = Array.from(new Set([finalBrand.id, finalBrand.slug, targetSlug, finalBrand.name].filter(Boolean) as string[]));
  await Promise.all([
    saveCustomBrandToSettings(finalBrand),
    saveBrandOverride(identifiers, {
      name: finalBrand.name,
      slug: finalBrand.slug,
      logo_url: finalBrand.logo_url,
      public_id: finalBrand.public_id,
      website: finalBrand.website,
      is_channel_partner: finalBrand.is_channel_partner,
      display_order: finalBrand.display_order,
    }),
  ]);

  return finalBrand;
}

export async function deleteBrand(id: string, extra?: { slug?: string; name?: string }): Promise<boolean> {
  const adminClient = createAdminClient();
  const slug = extra?.slug || '';
  const name = extra?.name || '';
  const keys = Array.from(new Set([id, slug, name].filter(Boolean) as string[]));

  // 1. Mark in persistent deleted list in site_settings immediately
  await markBrandAsDeleted(keys);

  // 2. Remove from custom_brands in site_settings
  await removeCustomBrandFromSettings(id);
  if (slug) await removeCustomBrandFromSettings(slug);

  // 3. Remove from brand_overrides in site_settings
  await removeBrandOverride(keys);

  // 4. Try deleting from Supabase brands table
  if (adminClient) {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUUID) {
        await adminClient.from('brands').delete().eq('id', id);
      }
      if (slug) {
        await adminClient.from('brands').delete().eq('slug', slug);
      }
    } catch (err) {
      console.warn('Supabase brand delete attempt:', err);
    }
  }

  // 5. Remove from in-memory fallback store
  brandsStore = brandsStore.filter(b => b.id !== id && b.slug !== id && (!slug || b.slug !== slug));

  return true;
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
  const formattedMessage = enquiry.preferred_location
    ? `[Preferred Branch: ${enquiry.preferred_location}]\n\n${enquiry.message}`
    : enquiry.message;

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
          message: formattedMessage,
          status: 'pending',
        })
        .select()
        .single();
      if (!error && data) return { ...data, preferred_location: enquiry.preferred_location } as Enquiry;
    } catch (err) {
      console.warn('Supabase create enquiry error:', err);
    }
  }

  const newEnq: Enquiry = {
    id: `enq-${Date.now()}`,
    ...enquiry,
    message: formattedMessage,
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

// ---------------- HERO SETTINGS ----------------
export async function getHeroSettings(): Promise<HeroSettings> {
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'hero_section')
        .single();
      if (!error && data?.value) {
        return { ...initialHeroSettings, ...data.value } as HeroSettings;
      }
    } catch (err) {
      console.warn('Supabase hero settings query error:', err);
    }
  }
  return heroSettingsStore;
}

export async function updateHeroSettings(settings: Partial<HeroSettings>): Promise<HeroSettings> {
  const adminClient = createAdminClient();
  const updated: HeroSettings = { ...heroSettingsStore, ...settings };
  if (adminClient) {
    try {
      const { error } = await adminClient
        .from('site_settings')
        .upsert({ key: 'hero_section', value: updated, updated_at: new Date().toISOString() });
      if (error) {
        console.error('Supabase hero settings update error:', error);
        throw new Error(`Database error: ${error.message}`);
      }
    } catch (err) {
      console.error('Supabase hero settings exception:', err);
      throw err;
    }
  }
  heroSettingsStore = updated;
  return heroSettingsStore;
}

// ---------------- STORE LOCATIONS ----------------
export function getNormalizedLocationKey(loc?: { id?: string; name?: string }): string {
  if (!loc) return '';
  const name = (loc.name || '').toLowerCase().trim();
  const id = (loc.id || '').toLowerCase().trim();
  if (name.includes('elnix powerzone') || name.includes('chottanikkara') || id === 'loc-chottanikkara') {
    return 'shop-chottanikkara';
  }
  if (
    name.includes('powerzone trade') ||
    name.includes('trade links') ||
    name.includes('udayamperoor') ||
    id === 'loc-udayamperoor'
  ) {
    return 'shop-udayamperoor';
  }
  return id || name || 'unknown';
}

const localDeletedLocationKeys = new Set<string>();

async function getDeletedLocationKeys(): Promise<Set<string>> {
  const result = new Set<string>(localDeletedLocationKeys);
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const { data, error } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'deleted_locations')
        .single();
      if (!error && data?.value && Array.isArray((data.value as { keys?: string[] }).keys)) {
        for (const k of (data.value as { keys: string[] }).keys) {
          result.add(String(k).toLowerCase());
        }
      }
    } catch {
      // Ignore
    }
  }
  return result;
}

async function markLocationAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedLocationKeys.add(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedLocationKeys();
      for (const k of keys) {
        if (k) currentKeys.add(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_locations',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist deleted location key:', err);
    }
  }
}

async function unmarkLocationAsDeleted(keys: string[]) {
  for (const k of keys) {
    if (k) localDeletedLocationKeys.delete(String(k).toLowerCase());
  }
  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      const currentKeys = await getDeletedLocationKeys();
      for (const k of keys) {
        if (k) currentKeys.delete(String(k).toLowerCase());
      }
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'deleted_locations',
          value: { keys: Array.from(currentKeys) },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to unmark deleted location key:', err);
    }
  }
}

export async function getStoreLocations(options?: { onlyVisible?: boolean }): Promise<StoreLocation[]> {
  const adminClient = createAdminClient();
  let supabaseLocations: StoreLocation[] = [];

  if (adminClient) {
    try {
      // 1. Try public.locations table first
      const { data: tableData, error: tableError } = await adminClient
        .from('locations')
        .select('*')
        .order('display_order', { ascending: true });

      if (!tableError && Array.isArray(tableData) && tableData.length > 0) {
        supabaseLocations = tableData.map((row) => ({
          id: String(row.id),
          name: row.name || '',
          branch_label: row.branch_label || '',
          address: row.address || '',
          phone: row.phone || '',
          whatsapp: row.whatsapp || '',
          email: row.email || '',
          timings: row.timings || 'Mon - Sat: 9:00 AM - 8:00 PM\nSunday: 9:00 AM - 4:00 PM',
          description: row.description || '',
          image_url: row.image_url || '',
          image_url_2: row.image_url_2 || '',
          map_embed_url: row.map_embed_url || '',
          map_directions_url: row.map_directions_url || '',
          latitude: row.latitude ? Number(row.latitude) : undefined,
          longitude: row.longitude ? Number(row.longitude) : undefined,
          is_primary: Boolean(row.is_primary),
          is_visible: row.is_visible !== false,
          display_order: Number(row.display_order ?? 1),
          created_at: row.created_at,
          updated_at: row.updated_at,
        }));
      }

      // 2. Also check site_settings for any custom updates if locations table was empty or missing images
      const { data: settingsData, error: settingsError } = await adminClient
        .from('site_settings')
        .select('value')
        .eq('key', 'store_locations')
        .single();

      if (!settingsError && settingsData?.value && Array.isArray((settingsData.value as { locations?: StoreLocation[] }).locations)) {
        const fromSettings = (settingsData.value as { locations: StoreLocation[] }).locations;
        if (supabaseLocations.length === 0) {
          supabaseLocations = fromSettings;
        } else {
          for (const sLoc of fromSettings) {
            const sKey = getNormalizedLocationKey(sLoc);
            const found = supabaseLocations.find(l => getNormalizedLocationKey(l) === sKey);
            if (found) {
              if (!found.image_url && sLoc.image_url) found.image_url = sLoc.image_url;
              if (!found.image_url_2 && sLoc.image_url_2) found.image_url_2 = sLoc.image_url_2;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Supabase store locations fetch error:', err);
    }
  }

  const deletedKeys = await getDeletedLocationKeys();

  // Combine: presets + saved Supabase locations + memory store
  // Use normalized key so Shop 1 and Shop 2 never cross-overwrite or duplicate
  const locationMap = new Map<string, StoreLocation>();

  // 1. Initial presets
  for (const loc of initialStoreLocations) {
    const key = getNormalizedLocationKey(loc);
    locationMap.set(key, { ...loc });
  }

  // 2. Supabase persisted locations (supersedes presets)
  for (const loc of supabaseLocations) {
    const key = getNormalizedLocationKey(loc);
    const existing = locationMap.get(key);
    if (existing) {
      locationMap.set(key, {
        ...existing,
        ...loc,
        image_url: loc.image_url || existing.image_url || '',
        image_url_2: loc.image_url_2 || existing.image_url_2 || '',
      });
    } else {
      locationMap.set(key, { ...loc });
    }
  }

  // 3. Memory store
  for (const loc of locationsStore) {
    const key = getNormalizedLocationKey(loc);
    const existing = locationMap.get(key);
    if (existing) {
      locationMap.set(key, {
        ...existing,
        ...loc,
        image_url: loc.image_url || existing.image_url || '',
        image_url_2: loc.image_url_2 || existing.image_url_2 || '',
      });
    } else {
      locationMap.set(key, { ...loc });
    }
  }

  // Filter out deleted locations
  let list = Array.from(locationMap.values()).filter((loc) => {
    const idKey = loc.id.toLowerCase();
    const normKey = getNormalizedLocationKey(loc).toLowerCase();
    return !deletedKeys.has(idKey) && !deletedKeys.has(normKey);
  });

  // Filter visibility if required
  if (options?.onlyVisible) {
    list = list.filter((loc) => loc.is_visible !== false);
  }

  // Sort by display_order ascending
  return list.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
}

export async function getStoreLocationById(id: string): Promise<StoreLocation | null> {
  const all = await getStoreLocations();
  return all.find((l) => l.id === id || getNormalizedLocationKey(l) === getNormalizedLocationKey({ id })) || null;
}

export async function saveStoreLocation(location: Partial<StoreLocation>): Promise<StoreLocation> {
  const adminClient = createAdminClient();
  const currentLocations = await getStoreLocations();

  const targetKey = getNormalizedLocationKey(location);
  const existingLoc = currentLocations.find((l) => getNormalizedLocationKey(l) === targetKey || l.id === location.id);

  // Keep the UUID if one exists, otherwise generate or keep preset ID
  const targetId = location.id || existingLoc?.id || (
    targetKey === 'shop-chottanikkara' 
      ? 'loc-chottanikkara' 
      : targetKey === 'shop-udayamperoor' 
        ? 'loc-udayamperoor' 
        : `loc-${Date.now()}`
  );

  // Unmark from deleted list if re-saving
  await unmarkLocationAsDeleted([targetId, targetKey]);

  const isPrimary = location.is_primary === true;
  const existingIdx = currentLocations.findIndex((l) => getNormalizedLocationKey(l) === targetKey || l.id === targetId);
  const baseOrder = existingIdx !== -1 ? (currentLocations[existingIdx].display_order ?? (existingIdx + 1)) : currentLocations.length + 1;

  // Preserve previous image_url if not explicitly modified
  const finalImageUrl = location.image_url !== undefined && location.image_url !== null && location.image_url !== ''
    ? location.image_url
    : (existingLoc?.image_url || '');

  const finalImageUrl2 = location.image_url_2 !== undefined && location.image_url_2 !== null && location.image_url_2 !== ''
    ? location.image_url_2
    : (existingLoc?.image_url_2 || '');

  const finalLocation: StoreLocation = {
    id: targetId,
    name: location.name || existingLoc?.name || 'Store Location',
    branch_label: location.branch_label !== undefined ? location.branch_label : (existingLoc?.branch_label || ''),
    address: location.address || existingLoc?.address || '',
    phone: location.phone || existingLoc?.phone || '',
    whatsapp: location.whatsapp || existingLoc?.whatsapp || '',
    email: location.email || existingLoc?.email || '',
    timings: location.timings || existingLoc?.timings || 'Mon - Sat: 9:00 AM - 8:00 PM\nSunday: 9:00 AM - 4:00 PM',
    description: location.description !== undefined ? location.description : (existingLoc?.description || ''),
    image_url: finalImageUrl,
    image_url_2: finalImageUrl2,
    map_embed_url: location.map_embed_url || existingLoc?.map_embed_url || '',
    map_directions_url: location.map_directions_url || existingLoc?.map_directions_url || '',
    latitude: location.latitude ?? existingLoc?.latitude,
    longitude: location.longitude ?? existingLoc?.longitude,
    is_primary: isPrimary,
    is_visible: location.is_visible !== false,
    display_order: location.display_order ?? baseOrder,
    created_at: existingLoc?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // If this location is primary, unset is_primary on all other locations
  let updatedList = currentLocations.map((l) => {
    if (getNormalizedLocationKey(l) === targetKey || l.id === targetId) return finalLocation;
    if (isPrimary && l.is_primary) return { ...l, is_primary: false };
    return l;
  });

  if (existingIdx === -1) {
    if (isPrimary) {
      updatedList = updatedList.map((l) => ({ ...l, is_primary: false }));
    }
    updatedList.push(finalLocation);
  }

  // Update in-memory store
  locationsStore = updatedList;

  // Persist to Supabase
  if (adminClient) {
    // 1. Persist to public.locations table
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);

      if (isUuid) {
        await adminClient
          .from('locations')
          .upsert({
            id: targetId,
            name: finalLocation.name,
            branch_label: finalLocation.branch_label,
            address: finalLocation.address,
            phone: finalLocation.phone,
            whatsapp: finalLocation.whatsapp,
            email: finalLocation.email,
            timings: finalLocation.timings,
            description: finalLocation.description,
            image_url: finalLocation.image_url,
            image_url_2: finalLocation.image_url_2,
            map_embed_url: finalLocation.map_embed_url,
            map_directions_url: finalLocation.map_directions_url,
            latitude: finalLocation.latitude,
            longitude: finalLocation.longitude,
            is_primary: finalLocation.is_primary,
            is_visible: finalLocation.is_visible,
            display_order: finalLocation.display_order,
            updated_at: new Date().toISOString(),
          });
      } else {
        const { data: updateData, error: updateError } = await adminClient
          .from('locations')
          .update({
            name: finalLocation.name,
            branch_label: finalLocation.branch_label,
            address: finalLocation.address,
            phone: finalLocation.phone,
            whatsapp: finalLocation.whatsapp,
            email: finalLocation.email,
            timings: finalLocation.timings,
            description: finalLocation.description,
            image_url: finalLocation.image_url,
            image_url_2: finalLocation.image_url_2,
            map_embed_url: finalLocation.map_embed_url,
            map_directions_url: finalLocation.map_directions_url,
            latitude: finalLocation.latitude,
            longitude: finalLocation.longitude,
            is_primary: finalLocation.is_primary,
            is_visible: finalLocation.is_visible,
            display_order: finalLocation.display_order,
            updated_at: new Date().toISOString(),
          })
          .ilike('name', `%${finalLocation.name.trim()}%`)
          .select();

        if (updateError || !updateData || updateData.length === 0) {
          await adminClient
            .from('locations')
            .insert({
              name: finalLocation.name,
              branch_label: finalLocation.branch_label,
              address: finalLocation.address,
              phone: finalLocation.phone,
              whatsapp: finalLocation.whatsapp,
              email: finalLocation.email,
              timings: finalLocation.timings,
              description: finalLocation.description,
              image_url: finalLocation.image_url,
              image_url_2: finalLocation.image_url_2,
              map_embed_url: finalLocation.map_embed_url,
              map_directions_url: finalLocation.map_directions_url,
              latitude: finalLocation.latitude,
              longitude: finalLocation.longitude,
              is_primary: finalLocation.is_primary,
              is_visible: finalLocation.is_visible,
              display_order: finalLocation.display_order,
              updated_at: new Date().toISOString(),
            });
        }
      }
    } catch (err) {
      console.warn('Supabase public.locations save error:', err);
    }

    // 2. Persist to site_settings under 'store_locations' for fallback redundancy
    try {
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'store_locations',
          value: { locations: updatedList },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to persist store_locations in site_settings:', err);
    }
  }

  return finalLocation;
}

export async function deleteStoreLocation(id: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const currentLocations = await getStoreLocations();
  const targetLoc = currentLocations.find((l) => l.id === id);
  const normKey = targetLoc ? getNormalizedLocationKey(targetLoc) : id;

  // 1. Mark in persistent deleted list immediately
  await markLocationAsDeleted([id, normKey]);

  // 2. Remove from locations list
  const updatedList = currentLocations.filter((l) => l.id !== id && getNormalizedLocationKey(l) !== normKey);
  locationsStore = updatedList;

  // 3. Persist to Supabase
  if (adminClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (isUuid) {
        await adminClient.from('locations').delete().eq('id', id);
      } else if (targetLoc?.name) {
        await adminClient.from('locations').delete().ilike('name', `%${targetLoc.name}%`);
      }
    } catch (err) {
      console.warn('Supabase public.locations delete error:', err);
    }

    try {
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'store_locations',
          value: { locations: updatedList },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to update store_locations after delete:', err);
    }
  }

  return true;
}

export async function reorderStoreLocations(orderedIds: string[]): Promise<boolean> {
  const currentLocations = await getStoreLocations();
  const updatedList = currentLocations.map((loc) => {
    const newIndex = orderedIds.indexOf(loc.id);
    if (newIndex !== -1) {
      return { ...loc, display_order: newIndex + 1 };
    }
    return loc;
  });

  updatedList.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
  locationsStore = updatedList;

  const adminClient = createAdminClient();
  if (adminClient) {
    try {
      for (const loc of updatedList) {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(loc.id);
        if (isUuid) {
          await adminClient.from('locations').update({ display_order: loc.display_order }).eq('id', loc.id);
        }
      }
    } catch (err) {
      console.warn('Failed to update display_order in locations table:', err);
    }

    try {
      await adminClient
        .from('site_settings')
        .upsert({
          key: 'store_locations',
          value: { locations: updatedList },
          updated_at: new Date().toISOString(),
        });
    } catch (err) {
      console.warn('Failed to save reordered store_locations:', err);
    }
  }

  return true;
}
