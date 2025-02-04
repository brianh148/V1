/*
  # Update Brian's Role to VA

  1. Changes
    - Update brianh148@yahoo.com user role to VA
  
  2. Security
    - Ensures user has proper VA permissions
*/

DO $$
BEGIN
  -- Update Brian's user role to VA
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"va"'
  )
  WHERE email = 'brianh148@yahoo.com';
END $$;