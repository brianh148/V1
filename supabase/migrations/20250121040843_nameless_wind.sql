/*
  # Fix RLS Policies

  1. Changes
    - Drop existing policies
    - Create simplified policies without recursion
    - Update sample data

  2. Security
    - Enable RLS on all tables
    - Add policies for read/write access
*/

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "allow_read_agents" ON agents;
    DROP POLICY IF EXISTS "allow_admin_manage_agents" ON agents;
    DROP POLICY IF EXISTS "allow_read_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "allow_create_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "allow_update_assignments" ON agent_assignments;
END $$;

-- Create simplified policies for agents
CREATE POLICY "agents_select"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "agents_insert"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

CREATE POLICY "agents_update"
  ON agents
  FOR UPDATE
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

CREATE POLICY "agents_delete"
  ON agents
  FOR DELETE
  TO authenticated
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'admin'
  );

-- Create simplified policies for agent_assignments
CREATE POLICY "assignments_select"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'va')
  );

CREATE POLICY "assignments_insert"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "assignments_update"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    current_setting('request.jwt.claims', true)::json->>'role' IN ('admin', 'va')
  );

-- Ensure RLS is enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

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