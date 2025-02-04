-- Drop existing policies to start fresh
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_select" ON agents;
    DROP POLICY IF EXISTS "agents_admin" ON agents;
    DROP POLICY IF EXISTS "assignments_select" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update" ON agent_assignments;
    DROP POLICY IF EXISTS "inspection_requests_select" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_insert" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_update" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_reports_select" ON inspection_reports;
    DROP POLICY IF EXISTS "inspection_reports_admin_va" ON inspection_reports;
END $$;

-- Create simplified policies for agents
CREATE POLICY "agents_select_simple"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "agents_admin_simple"
  ON agents
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Create simplified policies for agent_assignments
CREATE POLICY "assignments_select_simple"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "assignments_admin_va_select"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'va')
  ));

CREATE POLICY "assignments_insert_simple"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "assignments_update_simple"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "assignments_admin_va_update"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'va')
  ));

-- Create simplified policies for inspection_requests
CREATE POLICY "inspection_requests_select_simple"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "inspection_requests_admin_va_select"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'va')
  ));

CREATE POLICY "inspection_requests_insert_simple"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "inspection_requests_update_simple"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "inspection_requests_admin_va_update"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'va')
  ));

-- Create simplified policies for inspection_reports
CREATE POLICY "inspection_reports_select_simple"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT id FROM inspection_requests
      WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "inspection_reports_admin_va_simple"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' IN ('admin', 'va')
  ));

-- Ensure RLS is enabled on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;