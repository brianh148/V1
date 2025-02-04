/*
  # Initial Database Setup
  
  1. Schema Changes
    - Create property_source and property_status enums
    - Create properties table with all required fields
    - Create property_reviews table
    - Enable RLS and create policies
    - Add necessary indexes
    - Create updated_at trigger
  
  2. User Setup
    - Create admin, VA, and regular user accounts
    - Set up proper authentication and identities
  
  3. Security
    - Enable RLS on all tables
    - Set up proper access policies
    - Ensure proper user roles and permissions
*/

-- First, clean up any existing data to ensure clean installation
DO $$
BEGIN
    -- Drop existing tables if they exist
    DROP TABLE IF EXISTS property_reviews;
    DROP TABLE IF EXISTS properties;
    
    -- Drop existing types
    DROP TYPE IF EXISTS property_source;
    DROP TYPE IF EXISTS property_status;
    
    -- Remove existing test users
    DELETE FROM auth.users 
    WHERE email IN ('admin@example.com', 'va@example.com', 'user@example.com');
END $$;

-- Create enums
CREATE TYPE property_source AS ENUM ('mls', 'wholesaler');
CREATE TYPE property_status AS ENUM ('pending_review', 'published', 'rejected');

-- Create properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  address text NOT NULL,
  price numeric NOT NULL,
  bedrooms integer NOT NULL,
  bathrooms numeric NOT NULL,
  square_feet numeric NOT NULL,
  year_built integer NOT NULL,
  property_type text NOT NULL,
  source property_source NOT NULL,
  status property_status NOT NULL DEFAULT 'pending_review',
  photos text[] NOT NULL DEFAULT '{}',
  estimated_arv numeric,
  renovation_cost numeric,
  rent_potential numeric,
  mls_number text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create property reviews table
CREATE TABLE property_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  rehab_estimate numeric NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published properties"
  ON properties
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "VAs can read all properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'va'
  ));

CREATE POLICY "VAs can update properties they review"
  ON properties
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'va'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'va'
  ));

CREATE POLICY "Admins have full access to properties"
  ON properties
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.uid() = id
    AND raw_user_meta_data->>'role' = 'admin'
  ));

-- Create indexes
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_source ON properties(source);
CREATE INDEX idx_property_reviews_property_id ON property_reviews(property_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_reviews_updated_at
  BEFORE UPDATE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create initial users
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
  va_id uuid := gen_random_uuid();
  user_id uuid := gen_random_uuid();
BEGIN
  -- Insert admin user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "admin"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert admin identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    admin_id,
    json_build_object('sub', admin_id::text, 'email', 'admin@example.com'),
    'email',
    'admin@example.com',
    now(),
    now(),
    now()
  );

  -- Insert VA user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    va_id,
    'authenticated',
    'authenticated',
    'va@example.com',
    crypt('va123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "va"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert VA identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    va_id,
    va_id,
    json_build_object('sub', va_id::text, 'email', 'va@example.com'),
    'email',
    'va@example.com',
    now(),
    now(),
    now()
  );

  -- Insert regular user
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    user_id,
    'authenticated',
    'authenticated',
    'user@example.com',
    crypt('user123', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"role": "user"}'::jsonb,
    now(),
    now(),
    encode(gen_random_bytes(32), 'base64'),
    encode(gen_random_bytes(32), 'base64')
  );

  -- Insert regular user identity
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    user_id,
    user_id,
    json_build_object('sub', user_id::text, 'email', 'user@example.com'),
    'email',
    'user@example.com',
    now(),
    now(),
    now()
  );
END $$;