-- Disable RLS on properties table to allow public access
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Drop any existing policies on properties
DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "allow_read_properties" ON properties';
    EXECUTE 'DROP POLICY IF EXISTS "Anyone can read published properties" ON properties';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- Create a new policy that allows public access
CREATE POLICY "allow_public_read"
    ON properties
    FOR SELECT
    TO anon
    USING (true);

-- Enable RLS again with public access
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;