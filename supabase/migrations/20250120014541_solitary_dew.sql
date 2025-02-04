/*
  # Properties and Reviews Schema

  1. New Tables
    - `properties`
      - Core property information
      - MLS/Wholesaler data
      - Review status tracking
    - `property_reviews`
      - VA review details
      - Rehab estimates
      - Notes and recommendations

  2. Security
    - Enable RLS on all tables
    - Add policies for:
      - Authenticated users to read properties
      - VAs to update review status
      - Admins to manage all data

  3. Enums
    - property_source: MLS or Wholesaler
    - property_status: Pending Review, Published, or Rejected
*/

-- Create enums for property source and status
CREATE TYPE property_source AS ENUM ('mls', 'wholesaler');
CREATE TYPE property_status AS ENUM ('pending_review', 'published', 'rejected');

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