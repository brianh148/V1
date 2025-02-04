-- Create user_role type if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'va', 'client', 'wholesaler');
  END IF;
END $$;

-- Add role column to auth.users if it doesn't exist
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'client';

-- Add wholesaler_id and deal_status columns to properties table
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS wholesaler_id uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS deal_status text CHECK (deal_status IN ('available', 'pending', 'sold')) DEFAULT 'available';

-- Create index for wholesaler_id
CREATE INDEX IF NOT EXISTS idx_properties_wholesaler_id ON properties(wholesaler_id);

-- Create policy for wholesalers to manage their own properties
CREATE POLICY "wholesalers_manage_own_properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role = 'wholesaler'
    )
  )
  WITH CHECK (
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role = 'wholesaler'
    )
  );

-- Create policy for admins and VAs to manage properties
CREATE POLICY "admin_va_manage_properties"
  ON properties
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'va')
    )
  );

-- Create policy for public to read available properties
CREATE POLICY "public_read_available_properties"
  ON properties
  FOR SELECT
  TO authenticated
  USING (
    deal_status = 'available' OR
    wholesaler_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND role IN ('admin', 'va')
    )
  );