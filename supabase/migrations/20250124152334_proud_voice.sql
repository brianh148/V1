-- Drop existing policies first
DROP POLICY IF EXISTS "enable_read_properties" ON properties;
DROP POLICY IF EXISTS "enable_wholesaler_manage" ON properties;

-- Drop the trigger that might use the enum
DROP TRIGGER IF EXISTS validate_wholesaler_id_trigger ON properties;

-- Drop the existing status column if it exists
ALTER TABLE properties DROP COLUMN IF EXISTS status;

-- Create or replace the property_status enum
DROP TYPE IF EXISTS property_status CASCADE;
CREATE TYPE property_status AS ENUM (
  'pending_review',
  'published',
  'rejected'
);

-- Add the status column with the new enum type
ALTER TABLE properties 
  ADD COLUMN status property_status NOT NULL DEFAULT 'pending_review';

-- Create basic policy for reading properties
CREATE POLICY "enable_read_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for wholesaler management
CREATE POLICY "enable_wholesaler_manage"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    wholesaler_id IS NULL OR 
    wholesaler_id = auth.uid()
  )
  WITH CHECK (
    wholesaler_id IS NULL OR 
    wholesaler_id = auth.uid()
  );

-- Recreate the validation trigger
CREATE OR REPLACE FUNCTION validate_wholesaler_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.wholesaler_id IS NOT NULL AND 
     NOT EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.wholesaler_id) THEN
    RAISE EXCEPTION 'Invalid wholesaler_id: %', NEW.wholesaler_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_wholesaler_id_trigger
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION validate_wholesaler_id();