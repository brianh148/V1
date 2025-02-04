/*
  # Create users with roles

  1. Creates three users with different roles:
    - Admin user
    - VA (Virtual Assistant) user
    - Regular user
  
  2. Sets up metadata with role information
*/

-- Create users with roles
INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
SELECT
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"role": "admin"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
);

INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
SELECT
  'va@example.com',
  crypt('va123', gen_salt('bf')),
  now(),
  '{"role": "va"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'va@example.com'
);

INSERT INTO auth.users (
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data
)
SELECT
  'user@example.com',
  crypt('user123', gen_salt('bf')),
  now(),
  '{"role": "user"}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'user@example.com'
);