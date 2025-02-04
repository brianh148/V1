-- Drop all existing policies to start fresh
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "enable_read_agents" ON agents;
    DROP POLICY IF EXISTS "enable_admin_agents" ON agents;
    DROP POLICY IF EXISTS "assignments_select_simple" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_admin_va_select" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert_simple" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update_simple" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_admin_va_update" ON agent_assignments;
END $$;

-- Create a simple policy for reading agents (no recursion)
CREATE POLICY "read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a simple policy for managing agents (no recursion)
CREATE POLICY "manage_agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) = 'admin'
  );

-- Create policies for agent assignments
CREATE POLICY "read_assignments"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) IN ('admin', 'va')
  );

CREATE POLICY "create_assignments"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "update_assignments"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    (SELECT raw_user_meta_data->>'role' 
     FROM auth.users 
     WHERE id = auth.uid()) IN ('admin', 'va')
  );

-- Ensure RLS is enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Ensure we have some test agents
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