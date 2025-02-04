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
  status text NOT NULL DEFAULT 'pending',
  message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_assignments ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "allow_read_agents"
  ON agents
  FOR SELECT
  TO public
  USING (active = true);

CREATE POLICY "allow_read_assignments"
  ON agent_assignments
  FOR SELECT
  TO public
  USING (true);

-- Insert sample agents with realistic data
INSERT INTO agents (name, email, phone, photo, specialties, rating, review_count) VALUES
  (
    'Sarah Johnson',
    'sarah.johnson@realtor.com',
    '(313) 555-0123',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    ARRAY['Residential', 'Investment Properties', 'First-time Buyers'],
    4.9,
    127
  ),
  (
    'Michael Chen',
    'michael.chen@realtor.com',
    '(313) 555-0124',
    'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400',
    ARRAY['Commercial', 'Multi-family', 'Property Development'],
    4.8,
    98
  ),
  (
    'Jessica Martinez',
    'jessica.martinez@realtor.com',
    '(313) 555-0125',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    ARRAY['Luxury Homes', 'Waterfront Properties', 'Historic Homes'],
    4.95,
    156
  ),
  (
    'David Wilson',
    'david.wilson@realtor.com',
    '(313) 555-0126',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    ARRAY['Investment Properties', 'Fix and Flip', 'BRRR Strategy'],
    4.7,
    84
  ),
  (
    'Amanda Thompson',
    'amanda.thompson@realtor.com',
    '(313) 555-0127',
    'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400',
    ARRAY['First-time Buyers', 'Residential', 'Suburban Properties'],
    4.85,
    112
  )
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  photo = EXCLUDED.photo,
  specialties = EXCLUDED.specialties,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count,
  active = true;