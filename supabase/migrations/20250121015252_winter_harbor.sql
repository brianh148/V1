/*
  # Add Agent Management Tables

  1. New Tables
    - `agents`
      - Basic agent information
      - Contact details
      - Specialties and ratings
    - `agent_assignments`
      - Links agents with clients and properties
      - Tracks assignment status and messages

  2. Security
    - Enable RLS on both tables
    - Policies for reading and managing agent data
    - Policies for agent assignments
*/

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  photo text,
  specialties text[] NOT NULL DEFAULT '{}',
  rating numeric NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create agent assignments table
CREATE TABLE IF NOT EXISTS agent_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  message text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for agents table
CREATE POLICY "Anyone can view active agents"
  ON agents
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage agents"
  ON agents
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Policies for agent_assignments table
CREATE POLICY "Users can view their own assignments"
  ON agent_assignments
  FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Users can create assignments"
  ON agent_assignments
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Agents can view their assignments"
  ON agent_assignments
  FOR SELECT
  USING (agent_id IN (
    SELECT id FROM agents WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  ));

-- Create indexes
CREATE INDEX idx_agents_active ON agents(active);
CREATE INDEX idx_agent_assignments_agent_id ON agent_assignments(agent_id);
CREATE INDEX idx_agent_assignments_client_id ON agent_assignments(client_id);
CREATE INDEX idx_agent_assignments_property_id ON agent_assignments(property_id);

-- Add sample agents
INSERT INTO agents (name, email, phone, specialties, rating, review_count) VALUES
('John Smith', 'john.smith@example.com', '(555) 123-4567', ARRAY['Residential', 'Investment Properties'], 4.8, 156),
('Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', ARRAY['Commercial', 'Multi-family'], 4.9, 203),
('Michael Brown', 'michael.brown@example.com', '(555) 345-6789', ARRAY['Luxury Homes', 'Waterfront'], 4.7, 89);

-- Add updated_at trigger
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_assignments_updated_at
  BEFORE UPDATE ON agent_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();