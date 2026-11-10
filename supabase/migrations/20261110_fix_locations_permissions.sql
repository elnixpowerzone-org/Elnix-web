-- ==============================================================================
-- MIGRATION: 20261110_fix_locations_permissions.sql
-- PURPOSE: Fix RLS permissions so shop locations & photos persist permanently
-- SAFE & IDEMPOTENT: You can run this directly in Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure public.locations table exists with image columns
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

ALTER TABLE IF EXISTS public.locations 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- 2. Enable RLS and setup permissive policy (same pattern as categories and site_settings)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active locations" ON public.locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON public.locations;
DROP POLICY IF EXISTS "Enable all for locations" ON public.locations;

CREATE POLICY "Enable all for locations"
  ON public.locations FOR ALL
  USING (true)
  WITH CHECK (true);

-- 3. Also ensure site_settings has full access
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable all for site settings" ON public.site_settings;
CREATE POLICY "Enable all for site settings"
  ON public.site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

