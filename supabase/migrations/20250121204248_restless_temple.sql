-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "agents_select" ON agents;
    DROP POLICY IF EXISTS "agents_admin" ON agents;
    DROP POLICY IF EXISTS "assignments_select" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_insert" ON agent_assignments;
    DROP POLICY IF EXISTS "assignments_update" ON agent_assignments;
END $$;

-- Create simplified policies
CREATE POLICY "enable_read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "enable_admin_agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "enable_read_assignments"
  ON agent_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'va')
  );

CREATE POLICY "enable_insert_assignments"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "enable_update_assignments"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    auth.jwt() ->> 'role' IN ('admin', 'va')
  );

-- Update existing users with proper roles
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"client"'
)
WHERE raw_user_meta_data->>'role' IS NULL;

-- Create test users if they don't exist
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  va_id uuid := gen_random_uuid();
  client_id uuid := gen_random_uuid();
BEGIN
  -- Create admin user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    admin_id,
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"role": "admin"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  );

  -- Create VA user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    va_id,
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"role": "va"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'va@example.com'
  );

  -- Create client user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  )
  SELECT
    client_id,
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"role": "client"}'::jsonb,
    now(),
    now()
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'user@example.com'
  );
END $$;