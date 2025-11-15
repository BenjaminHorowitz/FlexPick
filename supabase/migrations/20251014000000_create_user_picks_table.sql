/*
  # Create user_picks table

  1. New Tables
    - `user_picks`
      - `id` (bigint, primary key, auto-increment)
      - `user_id` (uuid, foreign key to auth.users)
      - `bet_id` (bigint, foreign key to top10_bets)
      - `selected_option` (text) - Either 'A' or 'B'
      - `created_at` (timestamptz) - Timestamp when pick was first created
      - `updated_at` (timestamptz) - Timestamp when pick was last updated
      - Unique constraint on (user_id, bet_id) to prevent duplicate picks

  2. Security
    - Enable RLS on `user_picks` table
    - Add policy for authenticated users to read their own picks
    - Add policy for authenticated users to insert their own picks
    - Add policy for authenticated users to update their own picks
    - Add policy for authenticated users to delete their own picks

  3. Important Notes
    - Users can only access their own picks
    - The unique constraint ensures one pick per bet per user
    - Foreign keys maintain referential integrity with users and bets
*/

CREATE TABLE IF NOT EXISTS user_picks (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bet_id bigint NOT NULL REFERENCES top10_bets(id) ON DELETE CASCADE,
  selected_option text NOT NULL CHECK (selected_option IN ('A', 'B')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, bet_id)
);

ALTER TABLE user_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own picks"
  ON user_picks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own picks"
  ON user_picks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own picks"
  ON user_picks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own picks"
  ON user_picks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for faster queries by user_id
CREATE INDEX IF NOT EXISTS idx_user_picks_user_id ON user_picks(user_id);

-- Create index for faster queries by bet_id
CREATE INDEX IF NOT EXISTS idx_user_picks_bet_id ON user_picks(bet_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_picks_updated_at()
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
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_picks_timestamp'
  ) THEN
    CREATE TRIGGER update_user_picks_timestamp
      BEFORE UPDATE ON user_picks
      FOR EACH ROW
      EXECUTE FUNCTION update_user_picks_updated_at();
  END IF;
END $$;
