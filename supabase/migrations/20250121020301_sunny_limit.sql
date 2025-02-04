/*
  # Fix Agent Table Policies

  1. Changes
    - Update RLS policies for agents table
    - Add policies for authenticated users to view agents
    - Fix agent assignment policies

  2. Security
    - Maintain RLS protection
    - Allow proper access to agent data
    - Ensure authenticated users can view and interact with agents
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active agents" ON agents;
DROP POLICY IF EXISTS "Admins can manage agents" ON agents;
DROP POLICY IF EXISTS "Users can view their own assignments" ON agent_assignments;
DROP POLICY IF EXISTS "Users can create assignments" ON agent_assignments;
DROP POLICY IF EXISTS "Agents can view their assignments" ON agent_assignments;

-- Create new policies for agents table
CREATE POLICY "Enable read access for all users"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Enable insert for admins"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Enable update for admins"
  ON agents
  FOR UPDATE
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

CREATE POLICY "Enable delete for admins"
  ON agents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create new policies for agent_assignments table
CREATE POLICY "Enable read access for own assignments"
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

CREATE POLICY "Enable insert for authenticated users"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Enable update for involved parties"
  ON agent_assignments
  FOR UPDATE
  TO authenticated
  USING (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    client_id = auth.uid() OR
    agent_id IN (
      SELECT id FROM agents 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );