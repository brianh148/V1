-- First ensure wholesaler_id allows NULL values temporarily
ALTER TABLE properties 
  ALTER COLUMN wholesaler_id DROP NOT NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "enable_read_properties" ON properties;
DROP POLICY IF EXISTS "enable_wholesaler_manage" ON properties;

-- Create simplified policies
CREATE POLICY "enable_read_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (true);

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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_wholesaler_id ON properties(wholesaler_id);

-- Update existing properties to use proper UUID for wholesaler_id
UPDATE properties
SET wholesaler_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'user@example.com' 
  LIMIT 1
)
WHERE wholesaler_id IS NULL;

-- Add a validation trigger to ensure wholesaler_id is a valid UUID
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

-- Now make wholesaler_id NOT NULL after data is updated
ALTER TABLE properties 
  ALTER COLUMN wholesaler_id SET NOT NULL;