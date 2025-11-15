/*
  # Add overall_expected_value column to top10_bets table

  1. Changes
    - Add `overall_expected_value` (text) column to `top10_bets` table
    - This column will store the shared expected value for both sides of the bet
    - Replaces the need for separate expected_value_1 and expected_value_2 columns

  2. Notes
    - Existing expected_value_1 and expected_value_2 columns remain for backward compatibility
    - New column is nullable to avoid issues with existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'top10_bets' AND column_name = 'overall_expected_value'
  ) THEN
    ALTER TABLE top10_bets ADD COLUMN overall_expected_value text;
  END IF;
END $$;
