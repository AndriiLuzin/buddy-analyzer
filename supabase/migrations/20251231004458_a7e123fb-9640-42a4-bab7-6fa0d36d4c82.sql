-- Create meetings table
CREATE TABLE public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  meeting_date DATE NOT NULL,
  meeting_time TIME,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting participants table
CREATE TABLE public.meeting_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_participants ENABLE ROW LEVEL SECURITY;

-- Policies for meetings
CREATE POLICY "Users can view their own meetings" 
ON public.meetings FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own meetings" 
ON public.meetings FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own meetings" 
ON public.meetings FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own meetings" 
ON public.meetings FOR DELETE 
USING (auth.uid() = owner_id);

-- Policies for meeting participants
CREATE POLICY "Users can view participants of their meetings" 
ON public.meeting_participants FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.meetings 
  WHERE meetings.id = meeting_participants.meeting_id 
  AND meetings.owner_id = auth.uid()
));

CREATE POLICY "Users can add participants to their meetings" 
ON public.meeting_participants FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meetings 
  WHERE meetings.id = meeting_participants.meeting_id 
  AND meetings.owner_id = auth.uid()
));

CREATE POLICY "Users can remove participants from their meetings" 
ON public.meeting_participants FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.meetings 
  WHERE meetings.id = meeting_participants.meeting_id 
  AND meetings.owner_id = auth.uid()
));