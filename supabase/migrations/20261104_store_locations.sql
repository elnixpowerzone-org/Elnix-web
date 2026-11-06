-- ==============================================================================
-- MIGRATION: 20261104_store_locations.sql
-- ELNIX POWERZONE - STORE LOCATIONS SCHEMA & RLS POLICIES
--
-- Safe & Non-Destructive: Run this in the Supabase SQL Editor if you wish
-- to create a dedicated normalized relational table for store locations.
--
-- NOTE: The web application already persists multi-branch store locations
-- automatically inside the `site_settings` table (key: 'store_locations'),
-- which ensures immediate production persistence without manual execution.
-- ==============================================================================

-- 1. Create LOCATIONS table (Idempotent)
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  branch_label TEXT NOT NULL DEFAULT 'Store Branch',
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '8848 318 521',
  whatsapp TEXT DEFAULT '918848318521',
  email TEXT DEFAULT 'elnixpowerzone@gmail.com',
  timings TEXT DEFAULT 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 9:00 AM - 4:00 PM',
  description TEXT,
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

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Access: Public visitors can ONLY view published (visible) locations
DROP POLICY IF EXISTS "Public can view active locations" ON public.locations;
CREATE POLICY "Public can view active locations"
  ON public.locations FOR SELECT
  USING (is_visible = true OR public.is_admin());

-- 4. Admin Management Access: Only authenticated administrators can insert, update, or delete
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
CREATE POLICY "Admins can manage locations"
  ON public.locations FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. Seed Initial Locations (Only if table is newly created)
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
VALUES
  (
    'Elnix Powerzone — Flagship Showroom & Warehouse',
    'Headquarters & Main Showroom',
    'Elnix Tower, Eruvely, Chottanikkara, Ernakulam - 682312, Kerala, India',
    '8848 318 521',
    '918848318521',
    'elnixpowerzone@gmail.com',
    'Mon - Sat: 9:00 AM - 8:00 PM | Sunday: 9:00 AM - 4:00 PM',
    'Our premier retail showroom and wholesale distribution center featuring comprehensive brand displays, computerized battery load-testing bench, and rapid bulk dispatch.',
    'https://maps.google.com/maps?q=Elnix+Tower+Eruvely+Chottanikkara+Kerala+682312&t=&z=15&ie=UTF8&iwloc=&output=embed',
    'https://maps.google.com/?q=Elnix+Tower+Eruvely+Chottanikkara+Ernakulam',
    9.9328,
    76.3776,
    TRUE,
    TRUE,
    1
  ),
  (
    'Elnix Powerzone — Contractor & Project Support Desk',
    'Commercial & B2B Wing',
    'Near Statue Junction, Hill Palace Road, Thripunithura, Ernakulam - 682301, Kerala, India',
    '8848 318 521',
    '918848318521',
    'elnixpowerzone@gmail.com',
    'Mon - Sat: 9:30 AM - 7:00 PM | Sunday: Closed',
    'Dedicated project liaison office providing bill-of-materials estimations, wholesale contractor accounts, and priority site deliveries for builders and electricians.',
    'https://maps.google.com/maps?q=Statue+Junction+Thripunithura+Ernakulam+Kerala&t=&z=15&ie=UTF8&iwloc=&output=embed',
    'https://maps.google.com/?q=Statue+Junction+Thripunithura+Kerala',
    9.9506,
    76.3475,
    FALSE,
    TRUE,
    2
  )
ON CONFLICT DO NOTHING;

