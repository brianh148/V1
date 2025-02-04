-- Drop all existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "public_read" ON agents;
    DROP POLICY IF EXISTS "public_read" ON agent_assignments;
    DROP POLICY IF EXISTS "public_write" ON agent_assignments;
    DROP POLICY IF EXISTS "public_read" ON inspection_requests;
    DROP POLICY IF EXISTS "public_write" ON inspection_requests;
    DROP POLICY IF EXISTS "public_read" ON inspection_reports;
    DROP POLICY IF EXISTS "public_read" ON properties;
END $$;

-- Create simplified policies for agents
CREATE POLICY "agents_select"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

-- Create simplified policies for agent assignments
CREATE POLICY "assignments_select"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "assignments_insert"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "assignments_update"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- Create simplified policies for inspection requests
CREATE POLICY "inspection_requests_select"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "inspection_requests_insert"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "inspection_requests_update"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (client_id = auth.uid());

-- Create simplified policies for inspection reports
CREATE POLICY "inspection_reports_select"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    request_id IN (
      SELECT id FROM inspection_requests
      WHERE client_id = auth.uid()
    )
  );

-- Create simplified policies for properties
CREATE POLICY "properties_select"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Add admin policies
CREATE POLICY "admin_all_access"
  ON agents
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "admin_all_access"
  ON agent_assignments
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "admin_all_access"
  ON inspection_requests
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

CREATE POLICY "admin_all_access"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  ));

-- Add VA policies
CREATE POLICY "va_read_access"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'va'
  ));

CREATE POLICY "va_read_access"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'va'
  ));

CREATE POLICY "va_read_access"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'va'
  ));

-- Ensure RLS is enabled
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;