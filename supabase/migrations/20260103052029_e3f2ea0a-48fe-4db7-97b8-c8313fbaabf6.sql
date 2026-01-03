-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Invited users can view party details" ON public.parties;

-- The owner policy is sufficient for now - invited users will see party info via notifications