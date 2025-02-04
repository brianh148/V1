/*
  # Add initial roles and users

  1. New Users
    - Admin user: admin@example.com
    - VA user: va@example.com
    - Regular user: user@example.com

  2. Security
    - Set user roles via metadata
*/

-- Create initial users with different roles
DO $$
BEGIN
  -- Create admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb
  );

  -- Create VA user
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"role": "va"}'::jsonb
  );

  -- Create regular user
  INSERT INTO auth.users (
    instance_id,
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"role": "user"}'::jsonb
  );
END $$;