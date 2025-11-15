/*
  # Create Winners Today Table

  1. New Tables
    - `winners_today` - Stores the perfect picks for yesterday's results
      - `id` (bigint, primary key) - Unique identifier
      - `winners` (jsonb) - JSON map of bet_id -> 'A' or 'B' representing the winning picks
      - `created_at` (timestamptz) - When the record was created
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `winners_today` table
    - Add policy for public read access (anyone can view the perfect picks)

  3. Notes
    - This table stores the winning picks for yesterday's games
    - Used to display "Perfect Picks" - what the optimal selections would have been
    - Read-only for users, managed by admin
    - The winners column stores a JSON object like: {"1": "A", "2": "B", "3": "A", ...}
*/

CREATE TABLE IF NOT EXISTS winners_today (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  winners jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE winners_today ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view perfect picks"
  ON winners_today
  FOR SELECT
  TO anon, authenticated
  USING (true);
