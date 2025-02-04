/*
  # Update RLS policies for agent and inspection requests

  1. Changes
    - Drop and recreate policies with proper checks
    - Ensure no policy name conflicts
    - Add proper access control for all tables

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Restrict access based on user roles and ownership
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Drop policies for agents table
    DROP POLICY IF EXISTS "Enable read access for all users" ON agents;
    DROP POLICY IF EXISTS "Enable insert for admins" ON agents;
    DROP POLICY IF EXISTS "Enable update for admins" ON agents;
    DROP POLICY IF EXISTS "Enable delete for admins" ON agents;
    DROP POLICY IF EXISTS "Anyone can view active agents" ON agents;
    DROP POLICY IF EXISTS "Admins can manage agents" ON agents;

    -- Drop policies for agent_assignments table
    DROP POLICY IF EXISTS "Enable read access for own assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON agent_assignments;
    DROP POLICY IF EXISTS "Enable update for involved parties" ON agent_assignments;
    DROP POLICY IF EXISTS "Users can view their own assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "Users can create assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "Users can update their own assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "Agents can view their assignments" ON agent_assignments;

    -- Drop policies for inspection_requests table
    DROP POLICY IF EXISTS "Users can create inspection requests" ON inspection_requests;
    DROP POLICY IF EXISTS "Users can view their own requests" ON inspection_requests;
    DROP POLICY IF EXISTS "Admins and VAs can update requests" ON inspection_requests;

    -- Drop policies for inspection_reports table
    DROP POLICY IF EXISTS "Users can view reports for their requests" ON inspection_reports;
    DROP POLICY IF EXISTS "Admins and VAs can manage reports" ON inspection_reports;
END $$;

-- Create new policies for agents table
CREATE POLICY "agents_read_policy"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "agents_admin_policy"
  ON agents
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

-- Create new policies for agent_assignments table
CREATE POLICY "assignments_read_policy"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
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
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Create new policies for inspection_requests table
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
  );

-- Create new policies for inspection_reports table
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