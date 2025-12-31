-- Create group_messages table
CREATE TABLE public.group_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    sender_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies - users can view messages in groups they own
CREATE POLICY "Users can view messages in their groups"
ON public.group_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_messages.group_id 
        AND groups.owner_id = auth.uid()
    )
);

-- Users can send messages to their groups
CREATE POLICY "Users can send messages to their groups"
ON public.group_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_messages.group_id 
        AND groups.owner_id = auth.uid()
    )
);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON public.group_messages FOR DELETE
USING (auth.uid() = sender_id);

-- Enable realtime for group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;