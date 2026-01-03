-- Add unique constraint on game_id + player_index to prevent duplicate slots
ALTER TABLE public.battleship_players 
ADD CONSTRAINT battleship_players_game_player_unique 
UNIQUE (game_id, player_index);