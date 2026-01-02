-- Tables for party games

-- Game words for Impostor game
CREATE TABLE public.game_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Impostor games
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  player_count INTEGER NOT NULL,
  word_id UUID REFERENCES public.game_words(id),
  impostor_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  views_count INTEGER DEFAULT 0,
  starting_player INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player views for Impostor
CREATE TABLE public.player_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- Mafia games
CREATE TABLE public.mafia_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  player_count INTEGER NOT NULL,
  mafia_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mafia players
CREATE TABLE public.mafia_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.mafia_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  role TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- Crocodile words
CREATE TABLE public.crocodile_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crocodile games
CREATE TABLE public.crocodile_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  player_count INTEGER NOT NULL,
  current_word_id UUID REFERENCES public.crocodile_words(id),
  current_player INTEGER DEFAULT 0,
  showing_player INTEGER DEFAULT 0,
  current_guesser INTEGER DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'waiting',
  round INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crocodile players
CREATE TABLE public.crocodile_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.crocodile_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- WhoAmI characters
CREATE TABLE public.whoami_characters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhoAmI games
CREATE TABLE public.whoami_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  player_count INTEGER NOT NULL,
  guesser_index INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WhoAmI players
CREATE TABLE public.whoami_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.whoami_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  character_id UUID REFERENCES public.whoami_characters(id),
  guessed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- WhoAmI player views
CREATE TABLE public.whoami_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.whoami_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- Casino games
CREATE TABLE public.casino_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  player_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  guesser_index INTEGER DEFAULT 0,
  current_round INTEGER DEFAULT 1,
  current_combination TEXT[] DEFAULT '{}',
  guesses_in_round INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Casino players
CREATE TABLE public.casino_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.casino_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(game_id, player_index)
);

-- Enable RLS but allow public access for party games (no auth required)
ALTER TABLE public.game_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mafia_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mafia_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crocodile_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crocodile_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crocodile_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoami_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoami_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoami_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoami_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.casino_players ENABLE ROW LEVEL SECURITY;

-- Public access policies for party games (anyone can play)
CREATE POLICY "Public read game_words" ON public.game_words FOR SELECT USING (true);
CREATE POLICY "Public all games" ON public.games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all player_views" ON public.player_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all mafia_games" ON public.mafia_games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all mafia_players" ON public.mafia_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read crocodile_words" ON public.crocodile_words FOR SELECT USING (true);
CREATE POLICY "Public all crocodile_games" ON public.crocodile_games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all crocodile_players" ON public.crocodile_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read whoami_characters" ON public.whoami_characters FOR SELECT USING (true);
CREATE POLICY "Public all whoami_games" ON public.whoami_games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all whoami_players" ON public.whoami_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all whoami_views" ON public.whoami_views FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all casino_games" ON public.casino_games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all casino_players" ON public.casino_players FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for games
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.player_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mafia_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mafia_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crocodile_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.crocodile_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whoami_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whoami_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whoami_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.casino_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.casino_players;