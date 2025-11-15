/*
  # Add unique constraint to display_name column

  1. Changes
    - Add unique constraint to display_name column in profiles table
    - This ensures no two users can have the same display name
    - Case-insensitive uniqueness is enforced

  2. Notes
    - This prevents users from taking display names that are already in use
    - Works together with the frontend validation for better UX
    - The constraint will cause an error if duplicate display names are attempted
*/

CREATE UNIQUE INDEX IF NOT EXISTS profiles_display_name_unique_idx
  ON profiles (LOWER(display_name));

ALTER TABLE profiles DROP CONSTRAINT IF EXISTS display_name_unique;

ALTER TABLE profiles ADD CONSTRAINT display_name_unique
  UNIQUE USING INDEX profiles_display_name_unique_idx;
