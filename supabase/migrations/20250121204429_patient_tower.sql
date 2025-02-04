-- Update existing users with proper roles if they don't have one
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"client"'
)
WHERE raw_user_meta_data->>'role' IS NULL;

-- Create test users if they don't exist
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  va_id uuid := gen_random_uuid();
  client_id uuid := gen_random_uuid();
BEGIN
  -- Create admin user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    admin_id,
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  );

  -- Create VA user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    va_id,
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"role": "va"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'va@example.com'
  );

  -- Create client user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    client_id,
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"role": "client"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'user@example.com'
  );
END $$;