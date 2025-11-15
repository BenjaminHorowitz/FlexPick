/*
  # Create all_time_rankings table

  1. New Tables
    - `all_time_rankings`
      - `id` (uuid, primary key) - Unique identifier
      - `user_id` (uuid, foreign key) - References auth.users
      - `username` (text) - Display name for leaderboard
      - `win_pct` (numeric) - Win percentage
      - `w` (integer) - Total wins
      - `l` (integer) - Total losses
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `all_time_rankings` table
    - Add policy for public read access (leaderboard is public)
    - Add policy for authenticated users to view all rankings
*/

CREATE TABLE IF NOT EXISTS all_time_rankings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL,
  win_pct numeric(5,2) DEFAULT 0.00,
  w integer DEFAULT 0,
  l integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE all_time_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leaderboard rankings"
  ON all_time_rankings
  FOR SELECT
  TO public
  USING (true);

CREATE INDEX IF NOT EXISTS idx_all_time_rankings_win_pct ON all_time_rankings(win_pct DESC);
CREATE INDEX IF NOT EXISTS idx_all_time_rankings_user_id ON all_time_rankings(user_id);
