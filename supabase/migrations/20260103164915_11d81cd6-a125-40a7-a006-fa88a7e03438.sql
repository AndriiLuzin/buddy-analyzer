-- Create meeting_external_invites table for shareable meeting invite links
CREATE TABLE public.meeting_external_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meeting_external_invites ENABLE ROW LEVEL SECURITY;

-- Anyone can read invites by code (for guests accessing the link)
CREATE POLICY "Anyone can read meeting invites by code"
ON public.meeting_external_invites
FOR SELECT
USING (true);

-- Anyone can respond to invites (update status)
CREATE POLICY "Anyone can respond to meeting invites"
ON public.meeting_external_invites
FOR UPDATE
USING (true);

-- Meeting owners can create invites
CREATE POLICY "Meeting owners can create invites"
ON public.meeting_external_invites
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.meetings
  WHERE meetings.id = meeting_external_invites.meeting_id
  AND meetings.owner_id = auth.uid()
));

-- Meeting owners can delete invites
CREATE POLICY "Meeting owners can delete meeting invites"
ON public.meeting_external_invites
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.meetings
  WHERE meetings.id = meeting_external_invites.meeting_id
  AND meetings.owner_id = auth.uid()
));