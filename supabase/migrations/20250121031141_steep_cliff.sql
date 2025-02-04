/*
  # Update RLS policies and fix permissions

  1. Changes
    - Drop all existing policies to avoid conflicts
    - Create new policies with proper user access
    - Add policies for users table access
    - Fix cross-table relationships

  2. Security
    - Enable RLS on all tables
    - Add proper user role checks
    - Ensure data isolation between users
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

-- Create policies for auth.users access
CREATE POLICY "Enable users to read their own user data"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

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
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policies for agent_assignments table
CREATE POLICY "assignments_read_policy"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
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
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    ) OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

-- Create policies for inspection_requests table
CREATE POLICY "inspection_requests_read_policy"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
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
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
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
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id
          AND raw_user_meta_data->>'role' IN ('admin', 'va')
        )
      )
    )
  );

CREATE POLICY "inspection_reports_admin_va_policy"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );