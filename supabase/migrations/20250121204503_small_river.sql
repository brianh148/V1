/*
  # Add role column to users table

  1. Changes
    - Create user_role ENUM type
    - Add role column to users table with default value
    - Set role values for existing users

  2. Security
    - No changes to RLS policies needed
*/

-- Create user_role ENUM type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'inspector', 'client');
  END IF;
END $$;

-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE auth.users ADD COLUMN role user_role NOT NULL DEFAULT 'client';
  END IF;
END $$;

-- Update existing users with roles based on their metadata
UPDATE auth.users
SET role = CASE 
  WHEN raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
  WHEN raw_user_meta_data->>'role' = 'agent' THEN 'agent'::user_role
  WHEN raw_user_meta_data->>'role' = 'inspector' THEN 'inspector'::user_role
  ELSE 'client'::user_role
END
WHERE role IS NULL OR role = 'client';

-- Create function to sync role with metadata
CREATE OR REPLACE FUNCTION sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    NEW.role = (NEW.raw_user_meta_data->>'role')::user_role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to keep role in sync with metadata
DROP TRIGGER IF EXISTS sync_user_role_trigger ON auth.users;
CREATE TRIGGER sync_user_role_trigger
  BEFORE INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_role();