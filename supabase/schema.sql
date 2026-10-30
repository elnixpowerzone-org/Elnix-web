-- ==============================================================================
-- ELNIX POWERZONE - COMPLETE SUPABASE PRODUCTION SCHEMA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if needed (gen_random_uuid is standard in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create PROFILES table (Roles: 'admin' or 'user')
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create CATEGORIES table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  public_id TEXT, -- Cloudinary public ID
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create BRANDS table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  public_id TEXT, -- Cloudinary public ID
  website TEXT,
  is_channel_partner BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create PRODUCTS table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  unit TEXT DEFAULT 'Piece',
  image_url TEXT NOT NULL,
  public_id TEXT, -- Cloudinary public ID
  gallery TEXT[] DEFAULT '{}',
  gallery_public_ids TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT TRUE,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create ENQUIRIES / QUOTES table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'quote', 'product')),
  category TEXT,
  product_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create SITE_SETTINGS table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users can read their own profile; admins can read all
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Categories: public read; admin write
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Brands: public read; admin write
DROP POLICY IF EXISTS "Anyone can read brands" ON public.brands;
CREATE POLICY "Anyone can read brands"
  ON public.brands FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands"
  ON public.brands FOR ALL
  USING (public.is_admin());

-- Products: public read; admin write
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Enquiries: public can insert; admin can read/update/delete
DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit enquiry"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
  ON public.enquiries FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage enquiries"
  ON public.enquiries FOR ALL
  USING (public.is_admin());

-- Site Settings: public read; admin write
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON NEW AUTH USER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Admin User'),
    -- First created user defaults to 'admin', others to 'user' or as specified
    CASE
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'user')
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA (IDs are fully auto-generated with native gen_random_uuid)
-- ==============================================================================

-- 1. Seed Categories (id auto-generated)
INSERT INTO public.categories (name, slug, description, image_url, display_order)
VALUES
  ('Batteries', 'batteries', 'Inverter batteries, automotive batteries and more from top brands.', '/images/cat-batteries.jpg', 1),
  ('Electricals', 'electricals', 'Wires, cables, switches, MCBs, lighting and all electrical accessories.', '/images/cat-electricals.jpg', 2),
  ('Plumbing', 'plumbing', 'Pipes, fittings, valves and plumbing accessories for all applications.', '/images/cat-plumbing.jpg', 3),
  ('Sanitary', 'sanitary', 'Premium sanitary ware, bathroom fittings and related products.', '/images/cat-sanitary.jpg', 4)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;

-- 2. Seed Brands (id auto-generated)
INSERT INTO public.brands (name, slug, logo_url, display_order)
VALUES
  ('Exide', 'exide', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Exide_logo.svg/320px-Exide_logo.svg.png', 1),
  ('SF Sonic', 'sf-sonic', 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=300&q=80', 2),
  ('Bosch', 'bosch', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/320px-Bosch-logo.svg.png', 3),
  ('Luminous', 'luminous', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80', 4),
  ('Livguard', 'livguard', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80', 5),
  ('V-Guard', 'v-guard', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/V-Guard_Industries_Logo.svg/320px-V-Guard_Industries_Logo.svg.png', 6),
  ('Finolex Cables', 'finolex', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', 7),
  ('RR Kabel', 'rr-kabel', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80', 8),
  ('Polycab', 'polycab', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=300&q=80', 9),
  ('Cera', 'cera', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 10),
  ('Somany', 'somany', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 11),
  ('Jaquar', 'jaquar', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 12)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  display_order = EXCLUDED.display_order;

-- 3. Seed Products (id auto-generated, relationships matched dynamically by slug)
INSERT INTO public.products (name, slug, category_id, brand_id, tagline, description, price, in_stock, is_popular, is_featured, image_url, specifications)
VALUES
  (
    'Inverter Batteries',
    'inverter-batteries-exide',
    (SELECT id FROM public.categories WHERE slug = 'batteries' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'exide' LIMIT 1),
    'Daily common requirement type',
    'High performance tubular inverter batteries engineered for long power cuts, high thermal resilience and minimum water topping.',
    14500.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-inverter-battery.jpg',
    '{"Capacity": "150Ah / 12V", "Warranty": "36+18 Months", "Technology": "Tall Tubular", "Application": "Home / Office Inverters"}'::jsonb
  ),
  (
    'Automotive Batteries',
    'automotive-batteries-bosch',
    (SELECT id FROM public.categories WHERE slug = 'batteries' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'bosch' LIMIT 1),
    'Instant power for heavy vehicles',
    'Maintenance-free high cranking automotive batteries for cars, commercial vehicles, SUVs and generator sets.',
    6800.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-automotive-battery.jpg',
    '{"Voltage": "12V", "Cranking Amps": "650 CCA", "Maintenance": "Zero Maintenance", "Application": "Passenger & Commercial Vehicles"}'::jsonb
  ),
  (
    'Wires & Cables',
    'wires-and-cables-polycab',
    (SELECT id FROM public.categories WHERE slug = 'electricals' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'polycab' LIMIT 1),
    'Polycab, Finolex, RR Kabel all sizes',
    'Flame retardant (FR / FRLSH) pure electrolytic copper multi-strand building wires for residential and commercial electrification.',
    2350.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-wires-cables.jpg',
    '{"Sizes Available": "0.75, 1.0, 1.5, 2.5, 4.0, 6.0 sq.mm", "Conductor": "100% Electrolytic Bare Copper", "Insulation": "Flame Retardant PVC", "Standard": "IS 694 Certified"}'::jsonb
  ),
  (
    'MCBs & Switches',
    'mcbs-and-switches',
    (SELECT id FROM public.categories WHERE slug = 'electricals' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'v-guard' LIMIT 1),
    'Electrical safety and accessories',
    'Miniature Circuit Breakers, Isolators, RCCBs, Distribution Boards and luxury modular switches designed for total safety.',
    450.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-mcbs-switches.jpg',
    '{"Breaking Capacity": "10kA", "Poles": "SP, DP, TP, TPN", "Current Ratings": "6A to 63A", "Standard": "IEC 60898-1"}'::jsonb
  ),
  (
    'Bathroom Fittings',
    'bathroom-fittings-jaquar',
    (SELECT id FROM public.categories WHERE slug = 'sanitary' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'jaquar' LIMIT 1),
    'Jaquar, Cera showroom range',
    'High quality chrome finished brass basin mixers, diverters, health faucets, shower heads and bath accessories.',
    3200.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-bathroom-fittings.jpg',
    '{"Material": "Virgin Brass Ingots", "Finish": "Mirror Chrome / Matt Black", "Cartridge": "Ceramic Disc Cartridge", "Warranty": "10 Years Manufacturer Warranty"}'::jsonb
  ),
  (
    'Pipe Fittings',
    'pipe-fittings-plumbing',
    (SELECT id FROM public.categories WHERE slug = 'plumbing' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'polycab' LIMIT 1),
    'Complete plumbing solutions',
    'Comprehensive range of CPVC, UPVC, PVC pressure pipes, brass fittings, ball valves, solvent cements and drainage solutions.',
    180.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-pipe-fittings.jpg',
    '{"Types": "Elbows, Tees, Couplers, Unions, MTA, FTA", "Classes": "SDR 11, SDR 13.5, Schedule 40 & 80", "Application": "Potable Hot & Cold Water Distribution", "Jointing": "Solvent Cement"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock,
  is_popular = EXCLUDED.is_popular,
  is_featured = EXCLUDED.is_featured,
  image_url = EXCLUDED.image_url,
  specifications = EXCLUDED.specifications;

-- 4. Seed Site Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('store_info', '{
    "store_name": "Elnix Powerzone",
    "tagline": "Wholesale & Retail supplier of electrical, battery, plumbing and sanitary products",
    "phone": "8848 318 521",
    "whatsapp": "918848318521",
    "email": "elnixpowerzone@gmail.com",
    "address": "Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India",
    "timings": "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 4:00 PM",
    "google_maps_url": "https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================================================
-- HELPER QUERY TO PROMOTE ANY USER TO ADMIN
-- To make an existing user an admin, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ==============================================================================
-- ==============================================================================
-- ELNIX POWERZONE - COMPLETE SUPABASE PRODUCTION SCHEMA
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation if needed (gen_random_uuid is standard in Postgres 13+)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create PROFILES table (Roles: 'admin' or 'user')
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create CATEGORIES table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  public_id TEXT, -- Cloudinary public ID
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create BRANDS table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  public_id TEXT, -- Cloudinary public ID
  website TEXT,
  is_channel_partner BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create PRODUCTS table (Auto-generated UUIDs)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  tagline TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  unit TEXT DEFAULT 'Piece',
  image_url TEXT NOT NULL,
  public_id TEXT, -- Cloudinary public ID
  gallery TEXT[] DEFAULT '{}',
  gallery_public_ids TEXT[] DEFAULT '{}',
  specifications JSONB DEFAULT '{}'::jsonb,
  is_featured BOOLEAN DEFAULT FALSE,
  is_popular BOOLEAN DEFAULT TRUE,
  in_stock BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create ENQUIRIES / QUOTES table
CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'quote', 'product')),
  category TEXT,
  product_name TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'archived')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create SITE_SETTINGS table
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: users can read their own profile; admins can read all
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin());

-- Categories: public read; admin write
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin());

-- Brands: public read; admin write
DROP POLICY IF EXISTS "Anyone can read brands" ON public.brands;
CREATE POLICY "Anyone can read brands"
  ON public.brands FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage brands" ON public.brands;
CREATE POLICY "Admins can manage brands"
  ON public.brands FOR ALL
  USING (public.is_admin());

-- Products: public read; admin write
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products"
  ON public.products FOR ALL
  USING (public.is_admin());

-- Enquiries: public can insert; admin can read/update/delete
DROP POLICY IF EXISTS "Anyone can submit enquiry" ON public.enquiries;
CREATE POLICY "Anyone can submit enquiry"
  ON public.enquiries FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view enquiries" ON public.enquiries;
CREATE POLICY "Admins can view enquiries"
  ON public.enquiries FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage enquiries" ON public.enquiries;
CREATE POLICY "Admins can manage enquiries"
  ON public.enquiries FOR ALL
  USING (public.is_admin());

-- Site Settings: public read; admin write
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin());

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON NEW AUTH USER
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Admin User'),
    -- First created user defaults to 'admin', others to 'user' or as specified
    CASE
      WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin'
      ELSE COALESCE(new.raw_user_meta_data->>'role', 'user')
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DATA (IDs are fully auto-generated with native gen_random_uuid)
-- ==============================================================================

-- 1. Seed Categories (id auto-generated)
INSERT INTO public.categories (name, slug, description, image_url, display_order)
VALUES
  ('Batteries', 'batteries', 'Inverter batteries, automotive batteries and more from top brands.', '/images/cat-batteries.jpg', 1),
  ('Electricals', 'electricals', 'Wires, cables, switches, MCBs, lighting and all electrical accessories.', '/images/cat-electricals.jpg', 2),
  ('Plumbing', 'plumbing', 'Pipes, fittings, valves and plumbing accessories for all applications.', '/images/cat-plumbing.jpg', 3),
  ('Sanitary', 'sanitary', 'Premium sanitary ware, bathroom fittings and related products.', '/images/cat-sanitary.jpg', 4)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;

-- 2. Seed Brands (id auto-generated)
INSERT INTO public.brands (name, slug, logo_url, display_order)
VALUES
  ('Exide', 'exide', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Exide_logo.svg/320px-Exide_logo.svg.png', 1),
  ('SF Sonic', 'sf-sonic', 'https://images.unsplash.com/photo-1619725002198-6a689b72f41d?auto=format&fit=crop&w=300&q=80', 2),
  ('Bosch', 'bosch', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-logo.svg/320px-Bosch-logo.svg.png', 3),
  ('Luminous', 'luminous', 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=300&q=80', 4),
  ('Livguard', 'livguard', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80', 5),
  ('V-Guard', 'v-guard', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/V-Guard_Industries_Logo.svg/320px-V-Guard_Industries_Logo.svg.png', 6),
  ('Finolex Cables', 'finolex', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=300&q=80', 7),
  ('RR Kabel', 'rr-kabel', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=300&q=80', 8),
  ('Polycab', 'polycab', 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=300&q=80', 9),
  ('Cera', 'cera', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 10),
  ('Somany', 'somany', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 11),
  ('Jaquar', 'jaquar', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=300&q=80', 12)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  display_order = EXCLUDED.display_order;

-- 3. Seed Products (id auto-generated, relationships matched dynamically by slug)
INSERT INTO public.products (name, slug, category_id, brand_id, tagline, description, price, in_stock, is_popular, is_featured, image_url, specifications)
VALUES
  (
    'Inverter Batteries',
    'inverter-batteries-exide',
    (SELECT id FROM public.categories WHERE slug = 'batteries' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'exide' LIMIT 1),
    'Daily common requirement type',
    'High performance tubular inverter batteries engineered for long power cuts, high thermal resilience and minimum water topping.',
    14500.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-inverter-battery.jpg',
    '{"Capacity": "150Ah / 12V", "Warranty": "36+18 Months", "Technology": "Tall Tubular", "Application": "Home / Office Inverters"}'::jsonb
  ),
  (
    'Automotive Batteries',
    'automotive-batteries-bosch',
    (SELECT id FROM public.categories WHERE slug = 'batteries' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'bosch' LIMIT 1),
    'Instant power for heavy vehicles',
    'Maintenance-free high cranking automotive batteries for cars, commercial vehicles, SUVs and generator sets.',
    6800.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-automotive-battery.jpg',
    '{"Voltage": "12V", "Cranking Amps": "650 CCA", "Maintenance": "Zero Maintenance", "Application": "Passenger & Commercial Vehicles"}'::jsonb
  ),
  (
    'Wires & Cables',
    'wires-and-cables-polycab',
    (SELECT id FROM public.categories WHERE slug = 'electricals' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'polycab' LIMIT 1),
    'Polycab, Finolex, RR Kabel all sizes',
    'Flame retardant (FR / FRLSH) pure electrolytic copper multi-strand building wires for residential and commercial electrification.',
    2350.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-wires-cables.jpg',
    '{"Sizes Available": "0.75, 1.0, 1.5, 2.5, 4.0, 6.0 sq.mm", "Conductor": "100% Electrolytic Bare Copper", "Insulation": "Flame Retardant PVC", "Standard": "IS 694 Certified"}'::jsonb
  ),
  (
    'MCBs & Switches',
    'mcbs-and-switches',
    (SELECT id FROM public.categories WHERE slug = 'electricals' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'v-guard' LIMIT 1),
    'Electrical safety and accessories',
    'Miniature Circuit Breakers, Isolators, RCCBs, Distribution Boards and luxury modular switches designed for total safety.',
    450.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-mcbs-switches.jpg',
    '{"Breaking Capacity": "10kA", "Poles": "SP, DP, TP, TPN", "Current Ratings": "6A to 63A", "Standard": "IEC 60898-1"}'::jsonb
  ),
  (
    'Bathroom Fittings',
    'bathroom-fittings-jaquar',
    (SELECT id FROM public.categories WHERE slug = 'sanitary' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'jaquar' LIMIT 1),
    'Jaquar, Cera showroom range',
    'High quality chrome finished brass basin mixers, diverters, health faucets, shower heads and bath accessories.',
    3200.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-bathroom-fittings.jpg',
    '{"Material": "Virgin Brass Ingots", "Finish": "Mirror Chrome / Matt Black", "Cartridge": "Ceramic Disc Cartridge", "Warranty": "10 Years Manufacturer Warranty"}'::jsonb
  ),
  (
    'Pipe Fittings',
    'pipe-fittings-plumbing',
    (SELECT id FROM public.categories WHERE slug = 'plumbing' LIMIT 1),
    (SELECT id FROM public.brands WHERE slug = 'polycab' LIMIT 1),
    'Complete plumbing solutions',
    'Comprehensive range of CPVC, UPVC, PVC pressure pipes, brass fittings, ball valves, solvent cements and drainage solutions.',
    180.00,
    TRUE,
    TRUE,
    TRUE,
    '/images/prod-pipe-fittings.jpg',
    '{"Types": "Elbows, Tees, Couplers, Unions, MTA, FTA", "Classes": "SDR 11, SDR 13.5, Schedule 40 & 80", "Application": "Potable Hot & Cold Water Distribution", "Jointing": "Solvent Cement"}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock,
  is_popular = EXCLUDED.is_popular,
  is_featured = EXCLUDED.is_featured,
  image_url = EXCLUDED.image_url,
  specifications = EXCLUDED.specifications;

-- 4. Seed Site Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('store_info', '{
    "store_name": "Elnix Powerzone",
    "tagline": "Wholesale & Retail supplier of electrical, battery, plumbing and sanitary products",
    "phone": "8848 318 521",
    "whatsapp": "918848318521",
    "email": "elnixpowerzone@gmail.com",
    "address": "Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India",
    "timings": "Mon - Sat: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 4:00 PM",
    "google_maps_url": "https://maps.google.com/?q=Chottanikkara+Ernakulam+Kerala"
  }'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- ==============================================================================
-- HELPER QUERY TO PROMOTE ANY USER TO ADMIN
-- To make an existing user an admin, run:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- ==============================================================================
