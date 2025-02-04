/*
  # Clean up user accounts
  
  1. Changes
    - Remove test/role accounts (admin@example.com, va@example.com, user@example.com)
    - Keep only brianh148@yahoo.com account
  
  2. Security
    - Maintains existing RLS policies
*/

DO $$
BEGIN
  -- Remove test accounts while preserving brianh148@yahoo.com
  DELETE FROM auth.users 
  WHERE email IN ('admin@example.com', 'va@example.com', 'user@example.com');
END $$;