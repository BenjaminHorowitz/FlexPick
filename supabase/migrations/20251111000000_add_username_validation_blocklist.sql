/*
  # Add username validation blocklist system

  1. New Tables
    - `username_blocklist`
      - `id` (uuid, primary key)
      - `pattern` (text, unique) - Blocked username pattern or word
      - `reason` (text) - Reason for blocking
      - `created_at` (timestamptz) - When the pattern was added
      - `created_by` (uuid) - Admin who added the pattern (nullable)

  2. Security
    - Enable RLS on `username_blocklist` table
    - Add policy for authenticated users to read blocklist
    - Only admins can insert/update/delete (to be implemented later)

  3. Functions
    - Create function to validate username against blocklist
    - Create function to normalize leetspeak variations

  4. Notes
    - This table stores additional patterns that can be managed dynamically
    - The validation function will be used during signup and username changes
*/

CREATE TABLE IF NOT EXISTS username_blocklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pattern text UNIQUE NOT NULL,
  reason text DEFAULT 'Inappropriate content',
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE username_blocklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view blocklist"
  ON username_blocklist
  FOR SELECT
  TO authenticated
  USING (true);

CREATE OR REPLACE FUNCTION normalize_username(username_input text)
RETURNS text AS $$
DECLARE
  normalized text;
BEGIN
  normalized := LOWER(username_input);

  normalized := REPLACE(normalized, '4', 'a');
  normalized := REPLACE(normalized, '@', 'a');
  normalized := REPLACE(normalized, '3', 'e');
  normalized := REPLACE(normalized, '€', 'e');
  normalized := REPLACE(normalized, '1', 'i');
  normalized := REPLACE(normalized, '!', 'i');
  normalized := REPLACE(normalized, '0', 'o');
  normalized := REPLACE(normalized, '5', 's');
  normalized := REPLACE(normalized, '$', 's');
  normalized := REPLACE(normalized, '7', 't');
  normalized := REPLACE(normalized, '+', 't');

  normalized := REGEXP_REPLACE(normalized, '[^a-z0-9]', '', 'g');

  RETURN normalized;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION validate_username_against_blocklist(username_input text)
RETURNS boolean AS $$
DECLARE
  normalized text;
  blocked_pattern record;
BEGIN
  normalized := normalize_username(username_input);

  FOR blocked_pattern IN
    SELECT pattern FROM username_blocklist
  LOOP
    IF normalized LIKE '%' || normalize_username(blocked_pattern.pattern) || '%' THEN
      RETURN false;
    END IF;
  END LOOP;

  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE;

INSERT INTO username_blocklist (pattern, reason) VALUES
  ('admin', 'Reserved system name'),
  ('administrator', 'Reserved system name'),
  ('mod', 'Reserved system name'),
  ('moderator', 'Reserved system name'),
  ('support', 'Reserved system name'),
  ('official', 'Reserved system name'),
  ('system', 'Reserved system name'),
  ('root', 'Reserved system name')
ON CONFLICT (pattern) DO NOTHING;
