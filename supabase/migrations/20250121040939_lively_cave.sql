/*
  # Fix RLS Policies - Final Version

  1. Changes
    - Drop all existing policies
    - Create simplified policies without any nested queries
    - Update sample data

  2. Security
    - Enable RLS on all tables
    - Add basic policies for read/write access
*/

-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_select" ON agents;
    DROP POLICY IF EXISTS "agents_insert" ON agents;
    DROP POLICY IF EXISTS "agents_update" ON agents;
    DROP POLICY IF EXISTS "agents_delete" ON agents;
    DROP POLICY IF EXISTS "assignments_select" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update" ON agent_assignments;
END $$;

-- Create basic policy for agents
CREATE POLICY "basic_agents_policy"
  ON agents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create basic policies for agent assignments
CREATE POLICY "basic_assignments_policy"
  ON agent_assignments
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create basic policies for inspection requests
CREATE POLICY "basic_inspection_requests_policy"
  ON inspection_requests
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create basic policies for inspection reports
CREATE POLICY "basic_inspection_reports_policy"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;

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