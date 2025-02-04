-- Drop any existing policies on properties
DROP POLICY IF EXISTS "enable_read_properties" ON properties;
DROP POLICY IF EXISTS "enable_wholesaler_manage" ON properties;
DROP POLICY IF EXISTS "enable_read_published_properties" ON properties;

-- Create a simple policy that allows reading published properties
CREATE POLICY "allow_read_published_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (status = 'published');

-- Create policy for wholesalers to manage their properties
CREATE POLICY "allow_wholesaler_manage_properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (wholesaler_id = auth.uid())
  WITH CHECK (wholesaler_id = auth.uid());

-- Ensure RLS is enabled
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Update existing properties to ensure they are published
UPDATE properties 
SET status = 'published'::property_status 
WHERE status != 'published'::property_status;