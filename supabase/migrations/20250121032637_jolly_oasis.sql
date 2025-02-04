-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_select_policy" ON agents;
    DROP POLICY IF EXISTS "agents_admin_policy" ON agents;
    DROP POLICY IF EXISTS "assignments_select_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "inspection_requests_select_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_insert_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_update_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_reports_select_policy" ON inspection_reports;
    DROP POLICY IF EXISTS "inspection_reports_admin_va_policy" ON inspection_reports;
END $$;

-- Create simplified policies that avoid recursion

-- Agents policies
CREATE POLICY "enable_read_active_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "enable_admin_all_agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Agent assignments policies
CREATE POLICY "enable_read_own_assignments"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "enable_insert_own_assignments"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "enable_update_own_assignments"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

-- Inspection requests policies
CREATE POLICY "enable_read_own_requests"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "enable_insert_own_requests"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "enable_update_own_requests"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

-- Inspection reports policies
CREATE POLICY "enable_read_own_reports"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT id FROM inspection_requests
      WHERE client_id = auth.uid()
    ) OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "enable_admin_va_all_reports"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );