-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "basic_agents_policy" ON agents;
    DROP POLICY IF EXISTS "basic_assignments_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "basic_inspection_requests_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "basic_inspection_reports_policy" ON inspection_reports;
END $$;

-- Create simplified policies for agents
CREATE POLICY "agents_policy"
  ON agents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for agent assignments
CREATE POLICY "assignments_policy"
  ON agent_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for inspection requests
CREATE POLICY "inspection_requests_policy"
  ON inspection_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for inspection reports
CREATE POLICY "inspection_reports_policy"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create simplified policies for properties
CREATE POLICY "properties_policy"
  ON properties
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Update sample agents
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