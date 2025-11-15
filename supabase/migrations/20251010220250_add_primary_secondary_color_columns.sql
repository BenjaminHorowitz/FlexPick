/*
  # Add Primary and Secondary Color Columns

  1. Changes
    - Add `primary_1` column (jsonb) - supports single color string or array of 2 colors for Game Total
    - Add `secondary_1` column (jsonb) - supports single color string or array of 2 colors for Game Total
    - Add `primary_2` column (jsonb) - supports single color string or array of 2 colors for Game Total
    - Add `secondary_2` column (jsonb) - supports single color string or array of 2 colors for Game Total
    - Add `type` column (text) - stores bet type (e.g., "Game Total", "Passing Yards")

  2. Notes
    - Using jsonb allows flexible storage of both strings and arrays
    - For regular bets: store as string (e.g., "#FF0000")
    - For Game Total bets: store as array (e.g., ["#FF0000", "#0000FF"])
    - Keeps existing `team_color_1` and `team_color_2` columns for backward compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'primary_1'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN primary_1 jsonb DEFAULT '"#DC2626"'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'secondary_1'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN secondary_1 jsonb DEFAULT '"#3B82F6"'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'primary_2'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN primary_2 jsonb DEFAULT '"#DC2626"'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'secondary_2'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN secondary_2 jsonb DEFAULT '"#3B82F6"'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'type'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN type text DEFAULT '';
  END IF;
END $$;
