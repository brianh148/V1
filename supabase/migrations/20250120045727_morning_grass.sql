-- Enable the auth schema extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Clean up any existing test users to avoid conflicts
DELETE FROM auth.users 
WHERE email IN ('admin@example.com', 'va@example.com', 'user@example.com');

-- Create users with proper auth settings
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  va_id uuid := gen_random_uuid();
  user_id uuid := gen_random_uuid();
BEGIN
  -- Insert admin user
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    instance_id,
    is_super_admin
  ) VALUES (
    admin_id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "admin"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    '00000000-0000-0000-0000-000000000000',
    false
  );

  -- Insert VA user
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    instance_id,
    is_super_admin
  ) VALUES (
    va_id,
    'authenticated',
    'authenticated',
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "va"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    '00000000-0000-0000-0000-000000000000',
    false
  );

  -- Insert regular user
  INSERT INTO auth.users (
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    instance_id,
    is_super_admin
  ) VALUES (
    user_id,
    'authenticated',
    'authenticated',
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "user"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64'),
    '00000000-0000-0000-0000-000000000000',
    false
  );

  -- Insert identities for each user
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES
  -- Admin identity
  (
    admin_id,
    admin_id,
    jsonb_build_object('sub', admin_id::text, 'email', 'admin@example.com'),
    'email',
    'admin@example.com',
    now(),
    now(),
    now()
  ),
  -- VA identity
  (
    va_id,
    va_id,
    jsonb_build_object('sub', va_id::text, 'email', 'va@example.com'),
    'email',
    'va@example.com',
    now(),
    now(),
    now()
  ),
  -- Regular user identity
  (
    user_id,
    user_id,
    jsonb_build_object('sub', user_id::text, 'email', 'user@example.com'),
    'email',
    'user@example.com',
    now(),
    now(),
    now()
  );
END $$;