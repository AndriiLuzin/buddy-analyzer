-- Create battleship games table
CREATE TABLE public.battleship_games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  player_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'waiting',
  current_player_index INTEGER DEFAULT 0,
  grid_size INTEGER DEFAULT 6,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create battleship players table
CREATE TABLE public.battleship_players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.battleship_games(id) ON DELETE CASCADE,
  player_index INTEGER NOT NULL,
  ships JSONB NOT NULL DEFAULT '[]',
  hits_received JSONB NOT NULL DEFAULT '[]',
  is_eliminated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create battleship shots table (to track all shots)
CREATE TABLE public.battleship_shots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_id UUID NOT NULL REFERENCES public.battleship_games(id) ON DELETE CASCADE,
  shooter_index INTEGER NOT NULL,
  target_index INTEGER NOT NULL,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  is_hit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.battleship_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battleship_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battleship_shots ENABLE ROW LEVEL SECURITY;

-- Public access policies (like other games)
CREATE POLICY "Public all battleship_games" ON public.battleship_games FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all battleship_players" ON public.battleship_players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public all battleship_shots" ON public.battleship_shots FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.battleship_games;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battleship_players;
ALTER PUBLICATION supabase_realtime ADD TABLE public.battleship_shots;