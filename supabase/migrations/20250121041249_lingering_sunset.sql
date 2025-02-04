-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_policy" ON agents;
    DROP POLICY IF EXISTS "assignments_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "inspection_requests_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_reports_policy" ON inspection_reports;
    DROP POLICY IF EXISTS "properties_policy" ON properties;
END $$;

-- Disable RLS temporarily to reset everything
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create the absolute minimum policies needed
CREATE POLICY "public_read"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "public_read"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "public_write"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "public_read"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "public_write"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "public_read"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "public_read"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Ensure sample agents exist
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