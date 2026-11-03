-- ==============================================================================
-- MIGRATION: 20261103_hero_section_settings.sql
-- Purpose: Add Hero Section Background Video & CMS Settings
-- Safe & Idempotent: Run this in Supabase SQL Editor.
-- Does NOT affect any existing tables or work from other developers.
-- ==============================================================================

-- 1. Ensure site_settings table exists
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Ensure RLS Policies for site_settings allow reading and updating from backend API & Admin
DROP POLICY IF EXISTS "Anyone can read site settings" ON public.site_settings;
CREATE POLICY "Anyone can read site settings"
  ON public.site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Enable all for site settings" ON public.site_settings;
CREATE POLICY "Enable all for site settings"
  ON public.site_settings FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. Seed default hero_section settings ONLY IF NOT ALREADY PRESENT
-- (Will NEVER overwrite existing configuration if already customized)
INSERT INTO public.site_settings (key, value)
VALUES (
  'hero_section',
  '{
    "badge_text": "WHOLESALE & RETAIL",
    "headline_line1": "Your Trusted",
    "headline_line2": "Partner for",
    "headline_highlight": "Every Connection.",
    "description": "Elnix Powerzone supplies high quality electrical, battery, plumbing and sanitary products for homes, buildings and businesses across Kerala.",
    "primary_button_text": "Explore Products",
    "primary_button_link": "/products",
    "secondary_button_text": "Visit Our Store",
    "secondary_button_link": "/locations",
    "video_url": "https://assets.mixkit.co/videos/48870/48870-720.mp4",
    "poster_url": "",
    "overlay_opacity": 40
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;

