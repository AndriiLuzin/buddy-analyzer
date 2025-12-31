-- Create groups table
CREATE TABLE public.groups (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#3B82F6',
    icon text DEFAULT 'users',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- RLS policies for groups
CREATE POLICY "Users can view their own groups"
ON public.groups FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own groups"
ON public.groups FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own groups"
ON public.groups FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own groups"
ON public.groups FOR DELETE
USING (auth.uid() = owner_id);

-- Create group_members junction table
CREATE TABLE public.group_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
    friend_id uuid NOT NULL REFERENCES public.friends(id) ON DELETE CASCADE,
    added_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(group_id, friend_id)
);

-- Enable RLS
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for group_members (check ownership through groups table)
CREATE POLICY "Users can view members of their groups"
ON public.group_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_members.group_id 
        AND groups.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can add members to their groups"
ON public.group_members FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_members.group_id 
        AND groups.owner_id = auth.uid()
    )
);

CREATE POLICY "Users can remove members from their groups"
ON public.group_members FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.groups 
        WHERE groups.id = group_members.group_id 
        AND groups.owner_id = auth.uid()
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();