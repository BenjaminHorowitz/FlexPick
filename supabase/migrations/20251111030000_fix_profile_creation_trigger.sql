/*
  # Fix profile creation trigger to use display_name from metadata

  1. Changes
    - Update `handle_new_user` function to correctly pull display_name from user metadata
    - The function should use `display_name` field from raw_user_meta_data, not `username`
    - This ensures the trigger creates profiles with the correct display name

  2. Notes
    - The trigger automatically creates a profile when a user signs up
    - This eliminates the need for manual profile insertion in the frontend code
    - The trigger pulls: username, email, and display_name from the auth.users metadata
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.email,
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
