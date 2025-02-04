-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

-- Enable RLS
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_properties
CREATE POLICY "users_can_read_own_saved_properties"
  ON saved_properties
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "users_can_save_properties"
  ON saved_properties
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_can_unsave_properties"
  ON saved_properties
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Add updated_at trigger
CREATE TRIGGER update_saved_properties_updated_at
  BEFORE UPDATE ON saved_properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX idx_saved_properties_property_id ON saved_properties(property_id);