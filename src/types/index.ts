export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  public_id?: string;
  display_order?: number;
  product_count?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  public_id?: string;
  website?: string;
  is_channel_partner?: boolean;
  display_order?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand_id?: string;
  category?: Category;
  brand?: Brand;
  tagline: string;
  description: string;
  price?: number;
  unit?: string;
  image_url: string;
  public_id?: string;
  gallery?: string[];
  gallery_public_ids?: string[];
  specifications?: Record<string, string>;
  is_featured: boolean;
  is_popular: boolean;
  in_stock: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email?: string;
  type: 'general' | 'quote' | 'product';
  category?: string;
  product_name?: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'archived';
  notes?: string;
  created_at: string;
}

export interface SiteSettings {
  store_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  timings: string;
  google_maps_url: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
}

