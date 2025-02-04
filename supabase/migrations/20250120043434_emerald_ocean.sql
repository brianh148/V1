/*
  # Database Schema for Property Management System

  1. Tables
    - properties: Stores property listings with details
    - property_reviews: Stores VA reviews and estimates
  
  2. Security
    - RLS enabled on all tables
    - Policies for different user roles
    
  3. Changes
    - Safe type creation with existence checks
    - Table creation with proper constraints
    - RLS policies for access control
*/

-- Safely create enums if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_source') THEN
        CREATE TYPE property_source AS ENUM ('mls', 'wholesaler');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
        CREATE TYPE property_status AS ENUM ('pending_review', 'published', 'rejected');
    END IF;
END$$;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
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
CREATE TABLE IF NOT EXISTS property_reviews (
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
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can read published properties" ON properties;
    CREATE POLICY "Anyone can read published properties"
      ON properties
      FOR SELECT
      USING (status = 'published');

    DROP POLICY IF EXISTS "VAs can read all properties" ON properties;
    CREATE POLICY "VAs can read all properties"
      ON properties
      FOR SELECT
      TO authenticated
      USING (EXISTS (
        SELECT 1 FROM auth.users
        WHERE auth.uid() = id
        AND raw_user_meta_data->>'role' = 'va'
      ));

    DROP POLICY IF EXISTS "VAs can update properties they review" ON properties;
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

    DROP POLICY IF EXISTS "Admins have full access to properties" ON properties;
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
END$$;

-- Create indexes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_status') THEN
        CREATE INDEX idx_properties_status ON properties(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_source') THEN
        CREATE INDEX idx_properties_source ON properties(source);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_property_reviews_property_id') THEN
        CREATE INDEX idx_property_reviews_property_id ON property_reviews(property_id);
    END IF;
END$$;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_property_reviews_updated_at ON property_reviews;
CREATE TRIGGER update_property_reviews_updated_at
  BEFORE UPDATE ON property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();