-- Add description and notes columns to properties
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS notes text;

-- Drop existing policies
DROP POLICY IF EXISTS "enable_all_users_select" ON properties;
DROP POLICY IF EXISTS "enable_wholesalers_all" ON properties;

-- Create simplified policies that don't rely on roles
CREATE POLICY "allow_read_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_wholesalers_manage"
  ON properties
  FOR ALL
  TO authenticated
  USING (wholesaler_id = auth.uid())
  WITH CHECK (wholesaler_id = auth.uid());

-- Insert sample properties with wholesaler_id set to a specific user
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
  '2345 Oakwood Ave, Detroit, MI 48208',
  85000,
  3,
  1.5,
  1450,
  1945,
  'single-family',
  'wholesaler',
  'published',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available',
  145000,
  35000,
  'Charming single-family home with great potential. Perfect for a fix and flip or rental property.',
  'Property needs moderate renovation but has solid bones.',
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800']
),
(
  '789 Elmwood St, Detroit, MI 48201',
  92000,
  4,
  2,
  1800,
  1952,
  'single-family',
  'wholesaler',
  'published',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'pending',
  165000,
  45000,
  'Spacious 4-bedroom home in a desirable neighborhood. High rental demand area.',
  'Recent roof replacement, needs interior updates.',
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800']
),
(
  '456 Maple Rd, Detroit, MI 48203',
  78500,
  3,
  1,
  1350,
  1948,
  'single-family',
  'wholesaler',
  'pending_review',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available',
  135000,
  32000,
  'Affordable starter home with great layout. Close to schools and shopping.',
  'Minor cosmetic updates needed, mechanicals in good condition.',
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']
);