-- Create parties table
CREATE TABLE public.parties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  party_type TEXT NOT NULL DEFAULT 'other',
  party_date DATE NOT NULL,
  party_time TIME WITHOUT TIME ZONE,
  location TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create party participants table
CREATE TABLE public.party_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID NOT NULL REFERENCES public.parties(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  responded_at TIMESTAMP WITH TIME ZONE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_participants ENABLE ROW LEVEL SECURITY;

-- Parties policies
CREATE POLICY "Users can view their own parties"
ON public.parties FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own parties"
ON public.parties FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own parties"
ON public.parties FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own parties"
ON public.parties FOR DELETE
USING (auth.uid() = owner_id);

-- Party participants policies
CREATE POLICY "Users can view participants of their parties"
ON public.party_participants FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.parties
  WHERE parties.id = party_participants.party_id
  AND parties.owner_id = auth.uid()
));

CREATE POLICY "Users can add participants to their parties"
ON public.party_participants FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.parties
  WHERE parties.id = party_participants.party_id
  AND parties.owner_id = auth.uid()
));

CREATE POLICY "Users can remove participants from their parties"
ON public.party_participants FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.parties
  WHERE parties.id = party_participants.party_id
  AND parties.owner_id = auth.uid()
));

-- Allow invited users to update their own participation status
CREATE POLICY "Invited users can update their participation"
ON public.party_participants FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.friends
  WHERE friends.id = party_participants.friend_id
  AND friends.friend_user_id = auth.uid()
));

-- Also allow party owners to view participants
CREATE POLICY "Invited users can view party details"
ON public.parties FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.party_participants pp
  JOIN public.friends f ON f.id = pp.friend_id
  WHERE pp.party_id = parties.id
  AND f.friend_user_id = auth.uid()
));

-- Index for faster queries
CREATE INDEX idx_parties_owner ON public.parties(owner_id);
CREATE INDEX idx_party_participants_party ON public.party_participants(party_id);
CREATE INDEX idx_party_participants_status ON public.party_participants(status);