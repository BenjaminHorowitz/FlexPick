/*
  # Create earliest_event table for pick deadline management

  1. New Tables
    - `earliest_event`
      - `id` (bigint, primary key, auto-increment)
      - `commence_time` (timestamptz) - UTC timestamp when the earliest game starts
      - `created_at` (timestamptz) - Row creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `earliest_event` table
    - Allow public read access (anon and authenticated users can view)
    - Only authenticated users can insert/update (for admin functionality)

  3. Important Notes
    - This table stores the earliest game start time to determine pick submission deadlines
    - Picks will automatically lock at the `commence_time`
    - Times are stored in UTC and converted to user's local timezone on frontend
    - Typically contains one row that gets updated daily
*/

CREATE TABLE IF NOT EXISTS earliest_event (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  commence_time timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE earliest_event ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read the earliest event time
CREATE POLICY "Anyone can view earliest event time"
  ON earliest_event
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users can insert (for admin purposes)
CREATE POLICY "Authenticated users can insert earliest event"
  ON earliest_event
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update (for admin purposes)
CREATE POLICY "Authenticated users can update earliest event"
  ON earliest_event
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_earliest_event_commence_time ON earliest_event(commence_time);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_earliest_event_updated_at()
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_earliest_event_timestamp'
  ) THEN
    CREATE TRIGGER update_earliest_event_timestamp
      BEFORE UPDATE ON earliest_event
      FOR EACH ROW
      EXECUTE FUNCTION update_earliest_event_updated_at();
  END IF;
END $$;

-- Insert a sample earliest_event for testing (tomorrow at midnight UTC)
INSERT INTO earliest_event (commence_time)
VALUES (DATE_TRUNC('day', NOW() + INTERVAL '1 day'))
ON CONFLICT DO NOTHING;
