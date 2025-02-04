-- First drop all dependent policies
DO $$ 
BEGIN
    -- Drop policies from properties table
    DROP POLICY IF EXISTS "VAs can read all properties" ON properties;
    DROP POLICY IF EXISTS "VAs can update properties they review" ON properties;
    DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;
    
    -- Drop policies from inspection_requests table
    DROP POLICY IF EXISTS "inspection_requests_admin_va_select" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_admin_va_update" ON inspection_requests;
    
    -- Drop policies from inspection_reports table
    DROP POLICY IF EXISTS "inspection_reports_admin_va_simple" ON inspection_reports;
    
    -- Drop policies from agents table
    DROP POLICY IF EXISTS "admin_all_access" ON agents;
    
    -- Drop policies from agent_assignments table
    DROP POLICY IF EXISTS "admin_all_access" ON agent_assignments;
    DROP POLICY IF EXISTS "va_read_access" ON agent_assignments;
    
    -- Drop policies from auth.users table
    DROP POLICY IF EXISTS "Enable users to read their own user data" ON auth.users;
    DROP POLICY IF EXISTS "users_manage_own" ON auth.users;
END $$;

-- Drop role-related tables
DROP TABLE IF EXISTS agent_assignments CASCADE;
DROP TABLE IF EXISTS agents CASCADE;
DROP TABLE IF EXISTS inspection_requests CASCADE;
DROP TABLE IF EXISTS inspection_reports CASCADE;

-- Disable RLS temporarily
ALTER TABLE auth.users DISABLE ROW LEVEL SECURITY;

-- Clean up user metadata and simplify structure
ALTER TABLE auth.users 
    DROP COLUMN IF EXISTS raw_user_meta_data CASCADE,
    DROP COLUMN IF EXISTS raw_app_meta_data CASCADE;

-- Add simplified columns
ALTER TABLE auth.users
    ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false,
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
    ADD COLUMN IF NOT EXISTS last_sign_in timestamptz;

-- Re-enable RLS with simple policy
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enable_users_manage_own"
    ON auth.users
    FOR ALL
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Clean up properties table policies safely
DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read published properties" ON properties';
    EXECUTE 'DROP POLICY IF EXISTS "VAs can read all properties" ON properties';
    EXECUTE 'DROP POLICY IF EXISTS "Admins have full access to properties" ON properties';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create simple policy for properties
CREATE POLICY "allow_read_properties"
    ON properties
    FOR SELECT
    TO authenticated
    USING (true);