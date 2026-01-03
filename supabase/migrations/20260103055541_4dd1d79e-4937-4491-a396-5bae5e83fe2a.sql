-- Create table for external party invites (for people without accounts)
CREATE TABLE public.party_external_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  invite_code TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.party_external_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read invite by code (for the public invite page)
CREATE POLICY "Anyone can read invites by code"
ON public.party_external_invites
FOR SELECT
USING (true);

-- Policy: Anyone can update their response (for RSVP)
CREATE POLICY "Anyone can respond to invites"
ON public.party_external_invites
FOR UPDATE
USING (true);

-- Policy: Party owners can create invites
CREATE POLICY "Party owners can create invites"
ON public.party_external_invites
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.parties
  WHERE parties.id = party_external_invites.party_id
  AND parties.owner_id = auth.uid()
));

-- Policy: Party owners can delete invites
CREATE POLICY "Party owners can delete invites"
ON public.party_external_invites
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.parties
  WHERE parties.id = party_external_invites.party_id
  AND parties.owner_id = auth.uid()
));