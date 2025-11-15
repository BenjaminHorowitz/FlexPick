/*
  # Add display_name column to profiles table

  1. Changes
    - Add `display_name` column to `profiles` table that mirrors the username
    - Update the `handle_new_user` function to set display_name from username
    - Backfill existing profiles with display_name from username

  2. Notes
    - Display name will be the user-facing name shown throughout the application
    - Initially it will be set to the username, but can be updated independently later if needed
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'display_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN display_name text;
  END IF;
END $$;

UPDATE profiles SET display_name = username WHERE display_name IS NULL;

ALTER TABLE profiles ALTER COLUMN display_name SET NOT NULL;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
