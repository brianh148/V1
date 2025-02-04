/*
  # Recreate agents table with simplified structure

  1. Changes
    - Drop existing agents table and related policies
    - Create new simplified agents table
    - Add basic RLS policies
    - Insert sample data

  2. Security
    - Enable RLS
    - Add policy for reading agents
    - Add policy for admin management
*/

-- Drop existing table and dependencies
DROP TABLE IF EXISTS agent_assignments CASCADE;
DROP TABLE IF EXISTS agents CASCADE;

-- Create new agents table
CREATE TABLE agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "allow_read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "allow_admin_manage_agents"
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

-- Create agent_assignments table
CREATE TABLE agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for assignments
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for assignments
CREATE POLICY "allow_read_assignments"
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

CREATE POLICY "allow_create_assignments"
  ON agent_assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "allow_update_assignments"
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

-- Insert sample agents
INSERT INTO agents (id, name, email) VALUES
  ('d7fb8f30-0b5e-4a43-a7aa-aa7fcc6e2c00', 'John Smith', 'john@example.com'),
  ('e8fc8f40-1c6f-5b54-b8bb-bb8fdd7f3d11', 'Sarah Johnson', 'sarah@example.com'),
  ('f9fd9f50-2d7f-6c65-c9cc-cc9fee8f4e22', 'Michael Brown', 'michael@example.com')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name;

-- Add updated_at trigger
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_assignments_updated_at
  BEFORE UPDATE ON agent_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();