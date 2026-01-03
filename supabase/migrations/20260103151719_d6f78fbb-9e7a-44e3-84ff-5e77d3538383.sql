-- Create table for storing phone verification codes
CREATE TABLE public.phone_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_phone_verifications_phone ON public.phone_verifications(phone);
CREATE INDEX idx_phone_verifications_expires ON public.phone_verifications(expires_at);

-- Enable RLS
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

-- Allow public access for phone verification (we validate with the code itself)
CREATE POLICY "Anyone can insert phone verifications" 
ON public.phone_verifications 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can read phone verifications" 
ON public.phone_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update phone verifications" 
ON public.phone_verifications 
FOR UPDATE 
USING (true);

-- Clean up old verifications automatically (optional - can be done via cron)
CREATE POLICY "Anyone can delete expired verifications" 
ON public.phone_verifications 
FOR DELETE 
USING (expires_at < now());