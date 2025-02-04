-- First, disable RLS to allow cleanup
ALTER TABLE IF EXISTS auth.users DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
BEGIN
    -- Drop policies from auth.users
    DROP POLICY IF EXISTS "admins_all_access_policy" ON auth.users;
    DROP POLICY IF EXISTS "users_read_own_policy" ON auth.users;
    DROP POLICY IF EXISTS "users_update_own_policy" ON auth.users;
    DROP POLICY IF EXISTS "agents_read_clients_policy" ON auth.users;
    DROP POLICY IF EXISTS "vas_read_clients_policy" ON auth.users;
    
    -- Drop any existing triggers
    DROP TRIGGER IF EXISTS sync_user_role_trigger ON auth.users;
    
    -- Drop any existing functions
    DROP FUNCTION IF EXISTS sync_user_role();
    DROP FUNCTION IF EXISTS assign_role_to_user(uuid, text);
    DROP FUNCTION IF EXISTS get_user_roles(uuid);
END $$;

-- Drop role-related tables if they exist
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Drop type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Clean up user metadata
UPDATE auth.users
SET 
    raw_user_meta_data = '{}'::jsonb,
    raw_app_meta_data = '{}'::jsonb
WHERE raw_user_meta_data IS NOT NULL OR raw_app_meta_data IS NOT NULL;

-- Remove any custom columns from auth.users
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'role'
    ) THEN
        ALTER TABLE auth.users DROP COLUMN role;
    END IF;
END $$;

-- Re-enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create basic policy for users to read/update their own data
CREATE POLICY "users_manage_own"
  ON auth.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);