-- Remove foreign key constraint that prevents adding friends who haven't registered
ALTER TABLE public.friends DROP CONSTRAINT IF EXISTS friends_friend_user_id_fkey;