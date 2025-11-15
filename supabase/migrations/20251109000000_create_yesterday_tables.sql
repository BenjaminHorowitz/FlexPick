/*
  # Create Yesterday's Bets and Picks Tables

  1. New Tables
    - `top10_bets_day1` - Clone of top10_bets structure for yesterday's bets
      - Same schema as top10_bets table
      - Stores completed bets from previous day

    - `user_picks_yesterday` - Stores user picks for yesterday's bets
      - `user_id` (uuid, primary key, references auth.users)
      - `picks` (jsonb) - JSON map of bet_id -> 'A' or 'B'
      - `is_locked` (boolean) - Whether picks are locked
      - `submitted_at` (timestamptz) - When picks were submitted
      - `created_at` (timestamptz) - Row creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on both tables
    - `top10_bets_day1`: Public read access (anyone can view yesterday's bets)
    - `user_picks_yesterday`: Users can only read their own picks

  3. Notes
    - Yesterday's data is read-only for display purposes
    - Picks are locked and cannot be modified after the day ends
*/

-- Create top10_bets_day1 table (clone of top10_bets)
CREATE TABLE IF NOT EXISTS top10_bets_day1 (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description_1 text NOT NULL,
  type_1 text NOT NULL,
  expected_value_1 text NOT NULL,
  team_color_1 text NOT NULL DEFAULT '#000000',
  is_team_1 boolean NOT NULL DEFAULT false,
  description_2 text NOT NULL,
  type_2 text NOT NULL,
  expected_value_2 text NOT NULL,
  team_color_2 text NOT NULL DEFAULT '#000000',
  is_team_2 boolean NOT NULL DEFAULT false,
  primary_1 jsonb DEFAULT '"#DC2626"'::jsonb,
  secondary_1 jsonb DEFAULT '"#3B82F6"'::jsonb,
  primary_2 jsonb DEFAULT '"#DC2626"'::jsonb,
  secondary_2 jsonb DEFAULT '"#3B82F6"'::jsonb,
  type text DEFAULT '',
  team_abbr_1 text DEFAULT '',
  team_abbr_2 text DEFAULT '',
  league_1 text DEFAULT '',
  league_2 text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE top10_bets_day1 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view yesterday's bets"
  ON top10_bets_day1
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create user_picks_yesterday table
CREATE TABLE IF NOT EXISTS user_picks_yesterday (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  picks jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_locked boolean NOT NULL DEFAULT true,
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_picks_yesterday ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own yesterday picks"
  ON user_picks_yesterday
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
