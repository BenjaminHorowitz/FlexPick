/*
  # Create yesterday_rankings table

  1. New Tables
    - `yesterday_rankings`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `Username` (text) - Display name for leaderboard
      - `win_pct` (numeric) - Win percentage for yesterday
      - `W` (integer) - Wins from yesterday
      - `L` (integer) - Losses from yesterday
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `yesterday_rankings` table
    - Add policy for public read access (leaderboard is public)

  3. Notes
    - This table stores daily rankings that reset each day
    - Rankings are calculated based on yesterday's pick results
*/

CREATE TABLE IF NOT EXISTS yesterday_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  "Username" text NOT NULL,
  win_pct numeric(5,2) DEFAULT 0.00,
  "W" integer DEFAULT 0,
  "L" integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE yesterday_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view yesterday rankings"
  ON yesterday_rankings
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_yesterday_rankings_win_pct ON yesterday_rankings(win_pct DESC);
CREATE INDEX IF NOT EXISTS idx_yesterday_rankings_user_id ON yesterday_rankings(user_id);
