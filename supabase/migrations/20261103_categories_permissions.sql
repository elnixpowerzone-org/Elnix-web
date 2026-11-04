-- ==============================================================================
-- MIGRATION: 20261103_categories_permissions.sql
-- Purpose: Ensure Categories table permits modifications and deletions
-- Safe & Idempotent: Run this in Supabase SQL Editor.
-- ==============================================================================

-- 1. Ensure RLS is active on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 2. Drop any blocking admin policies and allow full CRUD access
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Enable all for categories" ON public.categories;

CREATE POLICY "Enable all for categories"
  ON public.categories FOR ALL
  USING (true)
  WITH CHECK (true);

