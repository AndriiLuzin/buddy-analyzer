-- Create table for friend important dates
CREATE TABLE public.friend_dates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  date_type TEXT NOT NULL DEFAULT 'holiday',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.friend_dates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own friend dates"
ON public.friend_dates
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert friend dates"
ON public.friend_dates
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own friend dates"
ON public.friend_dates
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own friend dates"
ON public.friend_dates
FOR DELETE
USING (auth.uid() = owner_id);

-- Create index for faster lookups
CREATE INDEX idx_friend_dates_friend_id ON public.friend_dates(friend_id);
CREATE INDEX idx_friend_dates_owner_id ON public.friend_dates(owner_id);