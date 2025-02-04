/*
  # Fix RLS policies recursion

  1. Changes
    - Remove circular references in policies
    - Use JWT claims directly for role checks
    - Simplify policy conditions
    - Remove auth.users table dependencies

  2. Security
    - Maintain proper access control
    - Fix infinite recursion issues
    - Keep existing functionality intact
*/

-- Drop existing policies
DO $$ 
BEGIN
    -- Drop policies for agents table
    DROP POLICY IF EXISTS "agents_read_policy" ON agents;
    DROP POLICY IF EXISTS "agents_admin_policy" ON agents;
    
    -- Drop policies for agent_assignments table
    DROP POLICY IF EXISTS "assignments_read_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update_policy" ON agent_assignments;
    
    -- Drop policies for inspection_requests table
    DROP POLICY IF EXISTS "inspection_requests_read_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_insert_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_update_policy" ON inspection_requests;
    
    -- Drop policies for inspection_reports table
    DROP POLICY IF EXISTS "inspection_reports_read_policy" ON inspection_reports;
    DROP POLICY IF EXISTS "inspection_reports_admin_va_policy" ON inspection_reports;
END $$;

-- Create policies for agents table
CREATE POLICY "agents_read_policy"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "agents_admin_policy"
  ON agents
  FOR ALL
  TO authenticated
  USING (current_setting('request.jwt.claims')::json->>'role' = 'admin')
  WITH CHECK (current_setting('request.jwt.claims')::json->>'role' = 'admin');

-- Create policies for agent_assignments table
CREATE POLICY "assignments_read_policy"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = current_setting('request.jwt.claims')::json->>'email'
    ) OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  );

CREATE POLICY "assignments_insert_policy"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "assignments_update_policy"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = current_setting('request.jwt.claims')::json->>'email'
    ) OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  )
  WITH CHECK (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = current_setting('request.jwt.claims')::json->>'email'
    ) OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  );

-- Create policies for inspection_requests table
CREATE POLICY "inspection_requests_read_policy"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  );

CREATE POLICY "inspection_requests_insert_policy"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "inspection_requests_update_policy"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  )
  WITH CHECK (
    client_id = auth.uid() OR
    current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
  );

-- Create policies for inspection_reports table
CREATE POLICY "inspection_reports_read_policy"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspection_requests
      WHERE inspection_requests.id = request_id
      AND (
        inspection_requests.client_id = auth.uid() OR
        current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va')
      )
    )
  );

CREATE POLICY "inspection_reports_admin_va_policy"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va'))
  WITH CHECK (current_setting('request.jwt.claims')::json->>'role' IN ('admin', 'va'));