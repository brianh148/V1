-- Drop existing policies first to avoid conflicts
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "admins_all_access" ON auth.users;
    DROP POLICY IF EXISTS "users_read_own" ON auth.users;
    DROP POLICY IF EXISTS "users_update_own" ON auth.users;
    DROP POLICY IF EXISTS "agents_read_clients" ON auth.users;
    DROP POLICY IF EXISTS "vas_read_clients" ON auth.users;
END $$;

-- Enable RLS on auth.users table
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to access all rows
CREATE POLICY "admins_all_access_policy"
  ON auth.users
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy for users to read their own data
CREATE POLICY "users_read_own_policy"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create policy for users to update their own data
CREATE POLICY "users_update_own_policy"
  ON auth.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policy for agents to read assigned client data
CREATE POLICY "agents_read_clients_policy"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agent_assignments
      WHERE agent_assignments.client_id = auth.users.id
      AND agent_assignments.agent_id = (
        SELECT id FROM agents WHERE email = (
          SELECT email FROM auth.users WHERE id = auth.uid()
        )
      )
    )
  );

-- Create policy for VAs to read client data
CREATE POLICY "vas_read_clients_policy"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'va'
    )
  );