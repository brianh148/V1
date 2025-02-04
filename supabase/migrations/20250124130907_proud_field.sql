-- Add wholesaler_id and deal_status columns to properties table
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS wholesaler_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deal_status text CHECK (deal_status IN ('available', 'pending', 'sold')) DEFAULT 'available';

-- Create index for wholesaler_id
CREATE INDEX IF NOT EXISTS idx_properties_wholesaler_id ON properties(wholesaler_id);

-- Drop any existing policies to avoid conflicts
DROP POLICY IF EXISTS "wholesalers_manage_own_properties" ON properties;
DROP POLICY IF EXISTS "admin_va_manage_properties" ON properties;
DROP POLICY IF EXISTS "public_read_available_properties" ON properties;

-- Create simplified policies
CREATE POLICY "enable_all_users_select"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "enable_wholesalers_all"
  ON properties
  FOR ALL
  TO authenticated
  USING (wholesaler_id = auth.uid())
  WITH CHECK (wholesaler_id = auth.uid());

-- Add some test data
INSERT INTO properties (
  address,
  price,
  bedrooms,
  bathrooms,
  square_feet,
  year_built,
  property_type,
  source,
  status,
  wholesaler_id,
  deal_status
) VALUES (
  '123 Test Street, Detroit, MI',
  150000,
  3,
  2,
  1500,
  1950,
  'single-family',
  'wholesaler',
  'pending_review',
  auth.uid(),
  'available'
);