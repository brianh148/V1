-- Insert sample wholesale properties
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
  (SELECT id FROM auth.users WHERE role = 'wholesaler' LIMIT 1),
  'available',
  145000,
  35000,
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
  (SELECT id FROM auth.users WHERE role = 'wholesaler' LIMIT 1),
  'pending',
  165000,
  45000,
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
  (SELECT id FROM auth.users WHERE role = 'wholesaler' LIMIT 1),
  'available',
  135000,
  32000,
  ARRAY['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800']
),
(
  '1012 Pine St, Detroit, MI 48202',
  115000,
  5,
  2.5,
  2200,
  1955,
  'multi-family',
  'wholesaler',
  'published',
  (SELECT id FROM auth.users WHERE role = 'wholesaler' LIMIT 1),
  'sold',
  195000,
  55000,
  ARRAY['https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800']
),
(
  '567 Cedar Ave, Detroit, MI 48204',
  95000,
  4,
  2,
  1650,
  1950,
  'single-family',
  'wholesaler',
  'published',
  (SELECT id FROM auth.users WHERE role = 'wholesaler' LIMIT 1),
  'available',
  160000,
  42000,
  ARRAY['https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800']
);

-- Update the role of a test user to wholesaler if needed
UPDATE auth.users 
SET role = 'wholesaler'
WHERE email = 'user@example.com'
AND role != 'wholesaler';