-- Add missing columns to properties table if they don't exist
ALTER TABLE properties ADD COLUMN IF NOT EXISTS photos text[] NOT NULL DEFAULT '{}';
ALTER TABLE properties ADD COLUMN IF NOT EXISTS image text;

-- Update image column to use first photo from photos array
UPDATE properties 
SET image = photos[1]
WHERE image IS NULL AND array_length(photos, 1) > 0;

-- Add default image for properties without photos
UPDATE properties
SET image = 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'
WHERE image IS NULL;

-- Drop existing policies to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "enable_read_active_agents" ON agents;
    DROP POLICY IF EXISTS "enable_admin_all_agents" ON agents;
    DROP POLICY IF EXISTS "enable_read_own_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "enable_insert_own_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "enable_update_own_assignments" ON agent_assignments;
    DROP POLICY IF EXISTS "enable_read_own_requests" ON inspection_requests;
    DROP POLICY IF EXISTS "enable_insert_own_requests" ON inspection_requests;
    DROP POLICY IF EXISTS "enable_update_own_requests" ON inspection_requests;
    DROP POLICY IF EXISTS "enable_read_own_reports" ON inspection_reports;
    DROP POLICY IF EXISTS "enable_admin_va_all_reports" ON inspection_reports;
END $$;

-- Create simplified policies without recursion
CREATE POLICY "agents_select"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "agents_admin"
  ON agents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "assignments_select"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
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
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "inspection_requests_select"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "inspection_requests_insert"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "inspection_requests_update"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "inspection_reports_select"
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
          WHERE id = auth.uid()
          AND raw_user_meta_data->>'role' IN ('admin', 'va')
        )
      )
    )
  );

CREATE POLICY "inspection_reports_admin_va"
  ON inspection_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );