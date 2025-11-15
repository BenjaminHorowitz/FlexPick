/*
  # Add time-based validation to user_picks table

  1. Changes
    - Modify user_picks table to add columns needed for time validation
      - `picks` (jsonb) - Convert to JSONB for flexible storage
      - `is_locked` (boolean) - Manual lock flag
      - `submitted_at` (timestamptz) - Submission timestamp

  2. Security & Validation
    - Add RLS policies to prevent inserts/updates after earliest_event commence_time
    - Add policies to prevent modifications when is_locked is true
    - Add database function to check if picks are still allowed

  3. Important Notes
    - This ensures server-side validation that picks cannot be submitted after deadline
    - Works in conjunction with frontend validation for better UX
    - Times are compared in UTC to avoid timezone issues
*/

-- First, check if user_picks table needs the new columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_picks' AND column_name = 'picks'
  ) THEN
    ALTER TABLE user_picks ADD COLUMN picks jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_picks' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE user_picks ADD COLUMN is_locked boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_picks' AND column_name = 'submitted_at'
  ) THEN
    ALTER TABLE user_picks ADD COLUMN submitted_at timestamptz;
  END IF;
END $$;

-- Create function to check if picks submission is allowed based on time
CREATE OR REPLACE FUNCTION is_picks_submission_allowed()
RETURNS boolean AS $$
DECLARE
  earliest_time timestamptz;
BEGIN
  -- Get the earliest commence_time
  SELECT commence_time INTO earliest_time
  FROM earliest_event
  ORDER BY commence_time ASC
  LIMIT 1;

  -- If no earliest_event exists, allow submission (fail open)
  IF earliest_time IS NULL THEN
    RETURN true;
  END IF;

  -- Check if current time is before commence_time
  RETURN NOW() < earliest_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to recreate them with time validation
DROP POLICY IF EXISTS "Users can insert own picks" ON user_picks;
DROP POLICY IF EXISTS "Users can update own picks" ON user_picks;

-- Recreate insert policy with time validation
CREATE POLICY "Users can insert own picks before deadline"
  ON user_picks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND is_picks_submission_allowed()
  );

-- Recreate update policy with time validation and lock check
CREATE POLICY "Users can update own picks before deadline and when unlocked"
  ON user_picks
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    AND NOT COALESCE(is_locked, false)
    AND is_picks_submission_allowed()
  )
  WITH CHECK (
    auth.uid() = user_id
    AND is_picks_submission_allowed()
  );
