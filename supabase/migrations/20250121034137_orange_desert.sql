-- Drop existing agent policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_select_simple" ON agents;
    DROP POLICY IF EXISTS "agents_admin_simple" ON agents;
END $$;

-- Create a new simplified policy for reading agents
CREATE POLICY "enable_read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to read agent data

-- Create admin policy for managing agents
CREATE POLICY "enable_admin_agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Ensure active agents exist
INSERT INTO agents (name, email, phone, specialties, rating, review_count, active)
VALUES 
  ('John Smith', 'john.smith@example.com', '(555) 123-4567', ARRAY['Residential', 'Investment Properties'], 4.8, 156, true),
  ('Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', ARRAY['Commercial', 'Multi-family'], 4.9, 203, true),
  ('Michael Brown', 'michael.brown@example.com', '(555) 345-6789', ARRAY['Luxury Homes', 'Waterfront'], 4.7, 89, true)
ON CONFLICT (email) 
DO UPDATE SET 
  active = true,
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  specialties = EXCLUDED.specialties,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count;