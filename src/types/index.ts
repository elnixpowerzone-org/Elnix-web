export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  public_id?: string;
  display_order?: number;
  product_count?: number;
  is_visible?: boolean;
  custom_url?: string;
  icon?: string;
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
  preferred_location?: string;
  message: string;
  status: 'pending' | 'contacted' | 'completed' | 'archived';
  notes?: string;
  created_at: string;
}

export interface StoreLocation {
  id: string;
  name: string;
  branch_label: string;
  address: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  timings: string;
  description?: string;
  image_url?: string;
  image_url_2?: string;
  map_embed_url?: string;
  map_directions_url?: string;
  latitude?: number;
  longitude?: number;
  is_primary: boolean;
  is_visible: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
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
  // Contact page customizable settings
  contact_eyebrow?: string;
  contact_heading?: string;
  contact_description?: string;
  contact_enquiry_info?: string;
}

export interface HeroMetric {
  icon: string;
  title: string;
  subtitle: string;
}

export interface HeroSettings {
  badge_text: string;
  headline_line1: string;
  headline_line2: string;
  headline_highlight: string;
  description: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  video_url: string;
  video_public_id?: string;
  poster_url?: string;
  overlay_opacity: number; // e.g. 20 to 80 (default ~40)
  overlay_gradient_style?: 'subtle' | 'balanced' | 'deep';
  metrics?: HeroMetric[];
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
}
