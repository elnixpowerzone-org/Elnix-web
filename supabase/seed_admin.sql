-- ==============================================================================
-- ELNIX POWERZONE - SEED ADMIN USER
-- Run this query in Supabase SQL Editor:
-- Email:    admin@elnixpowerzone.in
-- Password: Elnix-user@2026
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Check if user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@elnixpowerzone.in';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Create user in Supabase auth.users with encrypted bcrypt password
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'admin@elnixpowerzone.in',
      crypt('Elnix-user@2026', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider": "email", "providers": ["email"]}'::jsonb,
      '{"full_name": "Elnix Administrator", "role": "admin"}'::jsonb,
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  ELSE
    -- If user already exists, update password and metadata
    UPDATE auth.users
    SET
      encrypted_password = crypt('Elnix-user@2026', gen_salt('bf')),
      email_confirmed_at = NOW(),
      updated_at = NOW(),
      raw_user_meta_data = '{"full_name": "Elnix Administrator", "role": "admin"}'::jsonb
    WHERE id = v_user_id;
  END IF;

  -- 2. Ensure auth.identities record exists
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    v_user_id,
    format('{"sub":"%s","email":"%s"}', v_user_id, 'admin@elnixpowerzone.in')::jsonb,
    'email',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (provider, id) DO NOTHING;

  -- 3. Ensure profile in public.profiles table has role = 'admin'
  INSERT INTO public.profiles (id, email, full_name, role, updated_at)
  VALUES (
    v_user_id,
    'admin@elnixpowerzone.in',
    'Elnix Administrator',
    'admin',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    role = 'admin',
    full_name = 'Elnix Administrator',
    updated_at = NOW();

END $$;

