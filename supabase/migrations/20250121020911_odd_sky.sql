/*
  # Add Inspection Request System

  1. New Tables
    - `inspection_requests`
      - Tracks inspection requests from clients
      - Stores status, comments, and scheduling info
    - `inspection_reports`
      - Stores inspection findings and recommendations
      - Links to photos and documents

  2. Security
    - Enable RLS on new tables
    - Add policies for clients and admins
*/

-- Create inspection requests table
CREATE TABLE IF NOT EXISTS inspection_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  scheduled_date timestamptz,
  comments text,
  report text,
  photos text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create inspection reports table
CREATE TABLE IF NOT EXISTS inspection_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES inspection_requests(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  findings text NOT NULL,
  recommendations text NOT NULL,
  estimated_repair_costs numeric NOT NULL,
  photos text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE inspection_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for inspection_requests
CREATE POLICY "Users can create inspection requests"
  ON inspection_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Users can view their own requests"
  ON inspection_requests
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

CREATE POLICY "Admins and VAs can update requests"
  ON inspection_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

-- Create policies for inspection_reports
CREATE POLICY "Users can view reports for their requests"
  ON inspection_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inspection_requests
      WHERE inspection_requests.id = request_id
      AND (
        inspection_requests.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE auth.uid() = id
          AND raw_user_meta_data->>'role' IN ('admin', 'va')
        )
      )
    )
  );

CREATE POLICY "Admins and VAs can manage reports"
  ON inspection_reports
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' IN ('admin', 'va')
    )
  );

-- Create indexes
CREATE INDEX idx_inspection_requests_client_id ON inspection_requests(client_id);
CREATE INDEX idx_inspection_requests_property_id ON inspection_requests(property_id);
CREATE INDEX idx_inspection_requests_status ON inspection_requests(status);
CREATE INDEX idx_inspection_reports_request_id ON inspection_reports(request_id);

-- Add updated_at triggers
CREATE TRIGGER update_inspection_requests_updated_at
  BEFORE UPDATE ON inspection_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_reports_updated_at
  BEFORE UPDATE ON inspection_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();