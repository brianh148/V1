/*
  # Add active column to agents table

  1. Changes
    - Add active column to agents table
    - Update existing agents to be active by default
    - Update RLS policies to filter by active status

  2. Security
    - Maintain existing RLS policies
    - Add active status check to read policy
*/

-- Add active column if it doesn't exist
ALTER TABLE agents ADD COLUMN IF NOT EXISTS active boolean NOT NULL DEFAULT true;

-- Update existing agents to be active
UPDATE agents SET active = true WHERE active IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "allow_read_agents" ON agents;
DROP POLICY IF EXISTS "allow_admin_manage_agents" ON agents;

-- Create updated policies
CREATE POLICY "allow_read_agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

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

-- Update sample agents to ensure they're active
UPDATE agents 
SET 
  active = true,
  updated_at = now()
WHERE id IN (
  'd7fb8f30-0b5e-4a43-a7aa-aa7fcc6e2c00',
  'e8fc8f40-1c6f-5b54-b8bb-bb8fdd7f3d11',
  'f9fd9f50-2d7f-6c65-c9cc-cc9fee8f4e22'
);