-- Create agents table if it doesn't exist
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

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can view active agents"
  ON agents
  FOR SELECT
  TO authenticated
  USING (active = true);

CREATE POLICY "Admins can manage agents"
  ON agents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create sample agents
INSERT INTO agents (name, email, phone, specialties, rating, review_count) VALUES
('John Smith', 'john.smith@example.com', '(555) 123-4567', ARRAY['Residential', 'Investment Properties'], 4.8, 156),
('Sarah Johnson', 'sarah.johnson@example.com', '(555) 234-5678', ARRAY['Commercial', 'Multi-family'], 4.9, 203),
('Michael Brown', 'michael.brown@example.com', '(555) 345-6789', ARRAY['Luxury Homes', 'Waterfront'], 4.7, 89),
('Emily Davis', 'emily.davis@example.com', '(555) 456-7890', ARRAY['First-time Buyers', 'Condos'], 4.9, 167),
('David Wilson', 'david.wilson@example.com', '(555) 567-8901', ARRAY['Investment Properties', 'Multi-family'], 4.6, 124)
ON CONFLICT (email) DO NOTHING;