-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_properties" ON properties;
DROP POLICY IF EXISTS "allow_wholesalers_manage" ON properties;

-- Create simplified policies
CREATE POLICY "enable_read_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "enable_wholesaler_manage"
  ON properties
  FOR ALL
  TO authenticated
  USING (wholesaler_id = auth.uid())
  WITH CHECK (wholesaler_id = auth.uid());

-- Add sample data for testing
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
  deal_status,
  estimated_arv,
  renovation_cost,
  description,
  notes,
  photos
) VALUES 
(
  '123 Test Street, Detroit, MI',
  150000,
  3,
  2,
  1500,
  1950,
  'single-family',
  'wholesaler',
  'pending_review',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available',
  250000,
  50000,
  'Beautiful single-family home ready for renovation',
  'Great investment opportunity in growing neighborhood',
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']
);