-- Insert sample properties
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
  '123 Investment Ave, Detroit, MI 48201',
  135000,
  3,
  2,
  1600,
  1948,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
  195000,
  30000,
  1600,
  'Charming brick home with great bones. Perfect for BRRR strategy.',
  'Excellent location, needs cosmetic updates.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '456 Opportunity St, Detroit, MI 48202',
  165000,
  4,
  2.5,
  2100,
  1952,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'],
  235000,
  40000,
  1900,
  'Spacious colonial with high-end potential. Great flip opportunity.',
  'Original hardwoods throughout, updated electrical.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '789 Cash Flow Rd, Detroit, MI 48203',
  185000,
  2,
  2,
  1200,
  1960,
  'condo',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800'],
  225000,
  20000,
  1500,
  'Modern condo in prime location. Turn-key rental opportunity.',
  'Move-in ready, strong rental market.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '321 Duplex Way, Detroit, MI 48204',
  245000,
  4,
  3,
  2400,
  1955,
  'multi-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800'],
  345000,
  50000,
  2600,
  'Well-maintained duplex with separate utilities. Great cash flow.',
  'Both units currently rented, long-term tenants.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
),
(
  gen_random_uuid(),
  '654 Rehab Lane, Detroit, MI 48205',
  95000,
  3,
  1.5,
  1400,
  1945,
  'single-family',
  'mls',
  'published',
  ARRAY['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800'],
  175000,
  35000,
  1400,
  'Incredible value with huge upside potential. Perfect for experienced rehabber.',
  'Solid structure, needs full renovation.',
  (SELECT id FROM auth.users WHERE email = 'user@example.com' LIMIT 1),
  'available'
);

-- Create policy for reading published properties
DROP POLICY IF EXISTS "enable_read_published_properties" ON properties;
CREATE POLICY "enable_read_published_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (status = 'published');