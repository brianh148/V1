-- First clean up any existing policies
DROP POLICY IF EXISTS "allow_read_published_properties" ON properties;
DROP POLICY IF EXISTS "allow_wholesaler_manage_properties" ON properties;

-- Create simplified policies
CREATE POLICY "enable_read_all_properties"
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

-- Clean up existing data
DELETE FROM saved_properties;
DELETE FROM properties;

-- Insert fresh sample properties
INSERT INTO properties (
  id,
  address,
  price,
  bedrooms,
  bathrooms,
  square_feet,
  year_built,
  property_type,
  source,
  status,
  photos,
  estimated_arv,
  renovation_cost,
  rent_potential,
  description,
  notes,
  wholesaler_id,
  deal_status
) VALUES 
(
  gen_random_uuid(),
  '789 Investment Blvd, Detroit, MI 48201',
  155000,
  3,
  2,
  1750,
  1951,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
  225000,
  35000,
  1800,
  'Stunning brick colonial with modern updates. Perfect for house hacking or rental.',
  'Updated kitchen, original hardwoods throughout.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '234 Rental Row, Detroit, MI 48202',
  195000,
  4,
  2.5,
  2200,
  1958,
  'multi-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
  285000,
  45000,
  2200,
  'Well-maintained duplex in high-demand area. Separate utilities and entrances.',
  'Both units currently rented to long-term tenants.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '567 Flip Street, Detroit, MI 48203',
  125000,
  3,
  1.5,
  1450,
  1947,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  195000,
  32000,
  1500,
  'Classic Detroit bungalow with tons of potential. Great flip opportunity.',
  'Solid foundation, needs cosmetic updates.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '890 BRRR Avenue, Detroit, MI 48204',
  175000,
  5,
  3,
  2500,
  1962,
  'multi-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
  265000,
  48000,
  2400,
  'Spacious triplex with excellent cash flow potential. Perfect for BRRR strategy.',
  'All units occupied, recent electrical upgrade.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '123 Turnkey Lane, Detroit, MI 48205',
  165000,
  4,
  2,
  1900,
  1955,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'],
  235000,
  38000,
  1800,
  'Recently updated home ready for rental. Strong rental market area.',
  'New HVAC, updated kitchen and baths.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '456 Quick Flip Dr, Detroit, MI 48206',
  145000,
  3,
  2,
  1600,
  1949,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'],
  215000,
  35000,
  1600,
  'Charming ranch with great bones. Excellent flip potential in up-and-coming area.',
  'Roof 5 years old, needs interior updates.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
);

-- Add some saved properties for testing
INSERT INTO saved_properties (user_id, property_id)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  id
FROM properties
WHERE status = 'published'
LIMIT 3;