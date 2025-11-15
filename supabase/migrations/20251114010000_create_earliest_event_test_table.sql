/*
  # Create earliest_event_test table for testing pick deadline management

  1. New Tables
    - `earliest_event_test`
      - `id` (bigint, primary key, auto-increment)
      - `commence_time` (timestamptz) - UTC timestamp when the earliest game starts
      - `created_at` (timestamptz) - Row creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `earliest_event_test` table
    - Allow public read access (anon and authenticated users can view)
    - Only authenticated users can insert/update (for admin functionality)

  3. Important Notes
    - This is a test table that mirrors the structure of `earliest_event`
    - Used for testing deadline functionality without affecting production data
    - Times are stored in UTC and converted to user's local timezone on frontend
    - Can be configured via environment variable to switch between test and production tables
*/

CREATE TABLE IF NOT EXISTS earliest_event_test (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  commence_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE earliest_event_test ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the earliest event time
CREATE POLICY "Anyone can view earliest event test time"
  ON earliest_event_test
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert (for admin purposes)
CREATE POLICY "Authenticated users can insert earliest event test"
  ON earliest_event_test
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update (for admin purposes)
CREATE POLICY "Authenticated users can update earliest event test"
  ON earliest_event_test
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_earliest_event_test_commence_time ON earliest_event_test(commence_time);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_earliest_event_test_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_earliest_event_test_timestamp'
  ) THEN
    CREATE TRIGGER update_earliest_event_test_timestamp
      BEFORE UPDATE ON earliest_event_test
      FOR EACH ROW
      EXECUTE FUNCTION update_earliest_event_test_updated_at();
  END IF;
END $$;

-- Insert a sample earliest_event_test for testing (tomorrow at noon UTC)
INSERT INTO earliest_event_test (commence_time)
VALUES (DATE_TRUNC('day', NOW() + INTERVAL '1 day') + INTERVAL '12 hours')
ON CONFLICT DO NOTHING;
