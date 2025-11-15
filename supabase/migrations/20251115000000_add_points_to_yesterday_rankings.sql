/*
  # Add Points column to yesterday_rankings table

  1. Changes
    - Add `Points` (integer) column to yesterday_rankings table
      - Stores total points earned from yesterday's picks
      - Default value is 0
      - Points are calculated based on confidence rankings: rank 1 = 3 points, rank 2 = 2 points, rank 3 = 1 point

  2. Important Notes
    - Points are additive - each correct pick adds points based on its ranking
    - If a user didn't assign rankings, no points are awarded
    - This column provides a more nuanced scoring system than just W/L
*/

-- Add Points column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'yesterday_rankings' AND column_name = 'Points'
  ) THEN
    ALTER TABLE yesterday_rankings ADD COLUMN "Points" integer DEFAULT 0;
  END IF;
END $$;

-- Create index for sorting by Points
CREATE INDEX IF NOT EXISTS idx_yesterday_rankings_points ON yesterday_rankings("Points" DESC);
