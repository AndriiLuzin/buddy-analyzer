-- Add is_verified column to friends table to track if friend has created an account
ALTER TABLE public.friends ADD COLUMN IF NOT EXISTS is_verified boolean DEFAULT false;

-- Add index for faster lookups when matching friends by name/birthday
CREATE INDEX IF NOT EXISTS idx_friends_name_birthday ON public.friends (friend_name, friend_last_name, friend_birthday);