-- Allow users to insert notifications for other users (for meeting invites, etc.)
CREATE POLICY "Users can create notifications for others"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Add index for faster notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created ON public.notifications(user_id, created_at DESC);