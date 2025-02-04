-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_read_policy" ON agents;
    DROP POLICY IF EXISTS "agents_admin_policy" ON agents;
    DROP POLICY IF EXISTS "assignments_read_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update_policy" ON agent_assignments;
    DROP POLICY IF EXISTS "inspection_requests_read_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_insert_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_requests_update_policy" ON inspection_requests;
    DROP POLICY IF EXISTS "inspection_reports_read_policy" ON inspection_reports;
    DROP POLICY IF EXISTS "inspection_reports_admin_va_policy" ON inspection_reports;
END $$;

-- Simple read-only policy for agents
CREATE POLICY "agents_select_policy"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Simple admin policy for agents
CREATE POLICY "agents_admin_policy"
  ON agents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for agent_assignments
CREATE POLICY "assignments_select_policy"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'va')
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
    auth.jwt() ->> 'role' IN ('admin', 'va')
  );

-- Policies for inspection_requests
CREATE POLICY "inspection_requests_select_policy"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'va')
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
    auth.jwt() ->> 'role' IN ('admin', 'va')
  );

-- Policies for inspection_reports
CREATE POLICY "inspection_reports_select_policy"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM inspection_requests
      WHERE inspection_requests.id = inspection_reports.request_id
      AND (
        inspection_requests.client_id = auth.uid() OR
        auth.jwt() ->> 'role' IN ('admin', 'va')
      )
    )
  );

CREATE POLICY "inspection_reports_admin_va_policy"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'va'));

-- Ensure RLS is enabled on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;