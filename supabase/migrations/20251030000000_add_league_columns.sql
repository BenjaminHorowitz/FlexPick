/*
  # Add League Columns to top10_bets Table

  1. Changes
    - Add `league_1` column (text) - stores league identifier for option 1 (e.g., "NFL", "NBA", "NHL")
    - Add `league_2` column (text) - stores league identifier for option 2 (e.g., "NFL", "NBA", "NHL")

  2. Notes
    - These columns will be used to determine which sport icon to display
    - Default value is empty string for backward compatibility
    - NFL = Football helmet icon
    - NBA = Basketball icon
    - NHL = Hockey icon
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'league_1'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN league_1 text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'league_2'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN league_2 text DEFAULT '';
  END IF;
END $$;
