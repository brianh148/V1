/*
  # Fix user authentication with proper identities
  
  1. Changes
    - Remove existing test users
    - Create new users with proper auth settings
    - Create identities with required provider_id field
  
  2. Security
    - Users are created with proper authentication settings
    - Identities are properly linked to users
    - Email confirmation is set
*/

-- First, safely remove existing users if they exist
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
    instance_id,
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
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert admin identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    admin_id,
    json_build_object('sub', admin_id::text, 'email', 'admin@example.com'),
    'email',
    'admin@example.com',
    now(),
    now(),
    now()
  );

  -- Insert VA user
  INSERT INTO auth.users (
    instance_id,
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
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    va_id,
    'authenticated',
    'authenticated',
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "va"}',
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert VA identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    va_id,
    va_id,
    json_build_object('sub', va_id::text, 'email', 'va@example.com'),
    'email',
    'va@example.com',
    now(),
    now(),
    now()
  );

  -- Insert regular user
  INSERT INTO auth.users (
    instance_id,
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
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "user"}',
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert regular user identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_id,
    json_build_object('sub', user_id::text, 'email', 'user@example.com'),
    'email',
    'user@example.com',
    now(),
    now(),
    now()
  );
END $$;