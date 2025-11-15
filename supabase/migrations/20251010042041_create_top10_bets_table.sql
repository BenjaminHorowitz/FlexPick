/*
  # Create top10_bets table

  1. New Tables
    - `top10_bets`
      - `id` (bigint, primary key, auto-increment)
      - `description_1` (text) - Player/team name for left side
      - `market_1` (text) - Type of bet for left side
      - `expected_value_1` (text) - Projected value for left side
      - `team_color_1` (text) - Hex color code for left side
      - `is_team_1` (boolean) - Whether left side is a team or player
      - `description_2` (text) - Player/team name for right side
      - `market_2` (text) - Type of bet for right side
      - `expected_value_2` (text) - Projected value for right side
      - `team_color_2` (text) - Hex color code for right side
      - `is_team_2` (boolean) - Whether right side is a team or player
      - `created_at` (timestamptz) - Timestamp of row creation
  
  2. Security
    - Enable RLS on `top10_bets` table
    - Add policy for anyone to read the data (public bets display)
*/

CREATE TABLE IF NOT EXISTS top10_bets (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  description_1 text NOT NULL,
  market_1 text NOT NULL,
  expected_value_1 text NOT NULL,
  team_color_1 text NOT NULL DEFAULT '#000000',
  is_team_1 boolean NOT NULL DEFAULT false,
  description_2 text NOT NULL,
  market_2 text NOT NULL,
  expected_value_2 text NOT NULL,
  team_color_2 text NOT NULL DEFAULT '#000000',
  is_team_2 boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE top10_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view top10 bets"
  ON top10_bets
  FOR SELECT
  TO anon, authenticated
  USING (true);
