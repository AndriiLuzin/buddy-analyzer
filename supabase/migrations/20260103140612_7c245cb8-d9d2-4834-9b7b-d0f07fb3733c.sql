-- Add avatar_url column to friends table
ALTER TABLE public.friends ADD COLUMN IF NOT EXISTS avatar_url text;

-- Create storage bucket for friend avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('friend-avatars', 'friend-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own friend avatars
CREATE POLICY "Users can upload friend avatars"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'friend-avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own friend avatars
CREATE POLICY "Users can update their friend avatars"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'friend-avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own friend avatars
CREATE POLICY "Users can delete their friend avatars"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'friend-avatars' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to friend avatars (since bucket is public)
CREATE POLICY "Anyone can view friend avatars"
ON storage.objects
FOR SELECT
USING (bucket_id = 'friend-avatars');