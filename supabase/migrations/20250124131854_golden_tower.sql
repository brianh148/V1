-- First, ensure wholesaler_id allows NULL values temporarily
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

-- Now make wholesaler_id NOT NULL after data is updated
ALTER TABLE properties 
  ALTER COLUMN wholesaler_id SET NOT NULL;