/*
  # Add username validation constraint

  1. Changes
    - Add check constraint to profiles table to validate username format
    - Ensure usernames meet minimum requirements before insertion
    - Add trigger to validate username against blocklist

  2. Notes
    - This provides database-level validation as a security layer
    - Frontend validation provides better UX, but this prevents bypassing
*/

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS username_format_check;

ALTER TABLE profiles ADD CONSTRAINT username_format_check
  CHECK (
    username ~ '^[a-zA-Z0-9._-]{3,20}$' AND
    username ~ '[a-zA-Z]'
  );

CREATE OR REPLACE FUNCTION check_username_blocklist()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validate_username_against_blocklist(NEW.username) THEN
    RAISE EXCEPTION 'Username contains inappropriate content';
  END IF;

  IF NOT validate_username_against_blocklist(NEW.display_name) THEN
    RAISE EXCEPTION 'Display name contains inappropriate content';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS validate_username_trigger ON profiles;

CREATE TRIGGER validate_username_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION check_username_blocklist();
