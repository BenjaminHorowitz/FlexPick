/*
  # Add rankings column to user_picks_yesterday table

  1. Changes
    - Add `rankings` (jsonb) column to user_picks_yesterday table
      - Stores confidence rankings as a map: {bet_id: ranking_number}
      - Default value is an empty JSON object
      - Example: {"1": 1, "5": 2, "8": 3} means bet 1 has rank 1, bet 5 has rank 2, etc.

  2. Important Notes
    - This allows users to see which bets they ranked with confidence levels (1, 2, 3)
    - Rankings are optional - users can submit picks without rankings
    - Rankings are stored in the same row as picks for consistency
    - The JSONB format allows flexible storage and easy querying
*/

-- Add rankings column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_picks_yesterday' AND column_name = 'rankings'
  ) THEN
    ALTER TABLE user_picks_yesterday ADD COLUMN rankings jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
