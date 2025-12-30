-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  birthday DATE,
  category TEXT,
  quiz_answers INTEGER[],
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Public profiles can be viewed by anyone (for friend connections)
CREATE POLICY "Public profiles are viewable"
ON public.profiles FOR SELECT
USING (true);

-- Create friends table for connections
CREATE TABLE public.friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_name TEXT NOT NULL,
  friend_last_name TEXT NOT NULL,
  friend_birthday DATE,
  friend_category TEXT,
  friend_quiz_answers INTEGER[],
  friend_description TEXT,
  match_score INTEGER DEFAULT 0,
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(owner_id, friend_user_id)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Policies for friends
CREATE POLICY "Users can view their own friends"
ON public.friends FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert friends"
ON public.friends FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own friends"
ON public.friends FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own friends"
ON public.friends FOR DELETE
USING (auth.uid() = owner_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();