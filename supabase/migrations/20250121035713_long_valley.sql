-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- Enable RLS
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for roles
CREATE POLICY "roles_read_policy"
  ON roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "roles_admin_policy"
  ON roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create RLS policies for user_roles
CREATE POLICY "user_roles_read_policy"
  ON user_roles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "user_roles_admin_policy"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('admin', 'Full system access and management capabilities'),
  ('agent', 'Real estate agent with property listing and client management capabilities'),
  ('inspector', 'Property inspector with inspection management capabilities'),
  ('client', 'Regular user who can view properties and request services'),
  ('va', 'Virtual assistant with property review capabilities')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to assign role to user
CREATE OR REPLACE FUNCTION assign_role_to_user(
  p_user_id uuid,
  p_role_name text
)
RETURNS void AS $$
DECLARE
  v_role_id uuid;
BEGIN
  -- Get role ID
  SELECT id INTO v_role_id
  FROM roles
  WHERE name = p_role_name;

  -- Insert user role if role exists
  IF v_role_id IS NOT NULL THEN
    INSERT INTO user_roles (user_id, role_id)
    VALUES (p_user_id, v_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to get user roles
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id uuid)
RETURNS TABLE (role_name text) AS $$
BEGIN
  RETURN QUERY
  SELECT r.name
  FROM roles r
  JOIN user_roles ur ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;