-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "read_all_agents" ON agents;
    DROP POLICY IF EXISTS "read_own_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "create_own_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "update_own_assignments" ON agent_assignments;
END $$;

-- Create bare minimum policies for agents
CREATE POLICY "allow_select_agents"
  ON agents
  FOR SELECT
  USING (true);

-- Create bare minimum policies for agent assignments
CREATE POLICY "allow_select_assignments"
  ON agent_assignments
  FOR SELECT
  USING (true);

CREATE POLICY "allow_insert_assignments"
  ON agent_assignments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_update_assignments"
  ON agent_assignments
  FOR UPDATE
  USING (true);

-- Ensure RLS is enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Ensure test data exists
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