-- ==============================================================================
-- MIGRATION: 20261110_shop_locations_images.sql
-- ELNIX POWERZONE - 2 SHOP LOCATIONS & SHOP IMAGES SUPPORT
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your Elnix Powerzone project -> Click "SQL Editor" on the left menu
-- 3. Click "New Query", paste this SQL, and click "Run"
-- ==============================================================================

-- 1. Ensure columns for 2 Shop Images exist in public.locations table
ALTER TABLE IF EXISTS public.locations 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- 2. Create table if it does not already exist
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  branch_label TEXT DEFAULT '',
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '8848 318 521',
  whatsapp TEXT DEFAULT '918848318521',
  email TEXT DEFAULT 'elnixpowerzone@gmail.com',
  timings TEXT DEFAULT 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 9:00 AM - 4:00 PM',
  description TEXT,
  image_url TEXT,
  image_url_2 TEXT,
  map_embed_url TEXT,
  map_directions_url TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_primary BOOLEAN DEFAULT FALSE,
  is_visible BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS and setup policies
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active locations" ON public.locations;
CREATE POLICY "Public can view active locations"
  ON public.locations FOR SELECT
  USING (is_visible = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
CREATE POLICY "Admins can manage locations"
  ON public.locations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 4. Seed / Update the 2 Official Shop Locations
-- Shop 1: Elnix Powerzone (Chottanikkara)
INSERT INTO public.locations (
  name,
  branch_label,
  address,
  phone,
  whatsapp,
  email,
  timings,
  description,
  map_embed_url,
  map_directions_url,
  latitude,
  longitude,
  is_primary,
  is_visible,
  display_order
)
VALUES (
  'Elnix Powerzone',
  '',
  'Elnix Tower, Eruvely, Chottanikkara, Ernakulam - Pin: 682312',
  '8848 318 521',
  '918848318521',
  'elnixpowerzone@gmail.com',
  'Mon - Sat: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 4:00 PM',
  'Our store in Chottanikkara offering comprehensive electrical, battery, solar, plumbing, and sanitary displays.',
  'https://maps.google.com/maps?q=Elnix+Tower+Eruvely+Chottanikkara+Ernakulam+682312&t=&z=15&ie=UTF8&iwloc=&output=embed',
  'https://maps.google.com/?q=Elnix+Tower+Eruvely+Chottanikkara+Ernakulam+682312',
  9.9328,
  76.3776,
  FALSE,
  TRUE,
  1
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  branch_label = '',
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- Shop 2: Powerzone Trade Links (Udayamperoor, Vaikom Road)
INSERT INTO public.locations (
  name,
  branch_label,
  address,
  phone,
  whatsapp,
  email,
  timings,
  description,
  map_embed_url,
  map_directions_url,
  latitude,
  longitude,
  is_primary,
  is_visible,
  display_order
)
VALUES (
  'Powerzone Trade Links',
  '',
  'Elnix Tower, Udayamperoor, Vaikom Road, Ernakulam - Pin: 682307',
  '9287 343 835',
  '919287343835',
  'elnixpowerzone@gmail.com',
  'Mon - Sat: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 4:00 PM',
  'Our store on Vaikom Road supplying automotive & inverter batteries, solar systems, wiring, and plumbing products.',
  'https://maps.google.com/maps?q=Elnix+Tower+Udayamperoor+Vaikom+Road+Ernakulam+682307&t=&z=15&ie=UTF8&iwloc=&output=embed',
  'https://maps.google.com/?q=Elnix+Tower+Udayamperoor+Vaikom+Road+Ernakulam+682307',
  9.9042,
  76.3685,
  FALSE,
  TRUE,
  2
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  branch_label = '',
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;
