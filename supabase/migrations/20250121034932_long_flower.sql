-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "read_agents" ON agents;
    DROP POLICY IF EXISTS "manage_agents" ON agents;
    DROP POLICY IF EXISTS "read_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "create_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "update_assignments" ON agent_assignments;
END $$;

-- Create the simplest possible policy for agents
CREATE POLICY "allow_read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create simple admin policy for agents
CREATE POLICY "allow_admin_agents"
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

-- Create simple policies for agent assignments
CREATE POLICY "allow_read_assignments"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "allow_create_assignments"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "allow_update_assignments"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

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