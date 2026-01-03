export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      battleship_games: {
        Row: {
          code: string
          created_at: string
          current_player_index: number | null
          grid_size: number | null
          id: string
          player_count: number
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          current_player_index?: number | null
          grid_size?: number | null
          id?: string
          player_count: number
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_player_index?: number | null
          grid_size?: number | null
          id?: string
          player_count?: number
          status?: string
        }
        Relationships: []
      }
      battleship_players: {
        Row: {
          created_at: string
          game_id: string
          hits_received: Json
          id: string
          is_eliminated: boolean | null
          player_index: number
          player_name: string | null
          ships: Json
        }
        Insert: {
          created_at?: string
          game_id: string
          hits_received?: Json
          id?: string
          is_eliminated?: boolean | null
          player_index: number
          player_name?: string | null
          ships?: Json
        }
        Update: {
          created_at?: string
          game_id?: string
          hits_received?: Json
          id?: string
          is_eliminated?: boolean | null
          player_index?: number
          player_name?: string | null
          ships?: Json
        }
        Relationships: [
          {
            foreignKeyName: "battleship_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "battleship_games"
            referencedColumns: ["id"]
          },
        ]
      }
      battleship_shots: {
        Row: {
          created_at: string
          game_id: string
          id: string
          is_hit: boolean
          shooter_index: number
          target_index: number
          x: number
          y: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          is_hit?: boolean
          shooter_index: number
          target_index: number
          x: number
          y: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          is_hit?: boolean
          shooter_index?: number
          target_index?: number
          x?: number
          y?: number
        }
        Relationships: [
          {
            foreignKeyName: "battleship_shots_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "battleship_games"
            referencedColumns: ["id"]
          },
        ]
      }
      casino_games: {
        Row: {
          code: string
          created_at: string
          current_combination: string[] | null
          current_round: number | null
          guesser_index: number | null
          guesses_in_round: number | null
          id: string
          player_count: number
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          current_combination?: string[] | null
          current_round?: number | null
          guesser_index?: number | null
          guesses_in_round?: number | null
          id?: string
          player_count: number
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_combination?: string[] | null
          current_round?: number | null
          guesser_index?: number | null
          guesses_in_round?: number | null
          id?: string
          player_count?: number
          status?: string
        }
        Relationships: []
      }
      casino_players: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_index: number
          symbol: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_index: number
          symbol: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_index?: number
          symbol?: string
        }
        Relationships: [
          {
            foreignKeyName: "casino_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "casino_games"
            referencedColumns: ["id"]
          },
        ]
      }
      crocodile_games: {
        Row: {
          code: string
          created_at: string
          current_guesser: number | null
          current_player: number | null
          current_word_id: string | null
          id: string
          player_count: number
          round: number | null
          showing_player: number | null
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          current_guesser?: number | null
          current_player?: number | null
          current_word_id?: string | null
          id?: string
          player_count: number
          round?: number | null
          showing_player?: number | null
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_guesser?: number | null
          current_player?: number | null
          current_word_id?: string | null
          id?: string
          player_count?: number
          round?: number | null
          showing_player?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "crocodile_games_current_word_id_fkey"
            columns: ["current_word_id"]
            isOneToOne: false
            referencedRelation: "crocodile_words"
            referencedColumns: ["id"]
          },
        ]
      }
      crocodile_players: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_index: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_index: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "crocodile_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "crocodile_games"
            referencedColumns: ["id"]
          },
        ]
      }
      crocodile_words: {
        Row: {
          category: string | null
          created_at: string
          id: string
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
      friend_dates: {
        Row: {
          created_at: string
          date: string
          date_type: string
          friend_id: string
          id: string
          notes: string | null
          owner_id: string
          title: string
        }
        Insert: {
          created_at?: string
          date: string
          date_type?: string
          friend_id: string
          id?: string
          notes?: string | null
          owner_id: string
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          date_type?: string
          friend_id?: string
          id?: string
          notes?: string | null
          owner_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "friend_dates_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          },
        ]
      }
      friends: {
        Row: {
          avatar_url: string | null
          created_at: string
          friend_birthday: string | null
          friend_category: string | null
          friend_description: string | null
          friend_last_name: string
          friend_name: string
          friend_quiz_answers: number[] | null
          friend_user_id: string
          id: string
          last_interaction: string | null
          match_score: number | null
          owner_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          friend_birthday?: string | null
          friend_category?: string | null
          friend_description?: string | null
          friend_last_name: string
          friend_name: string
          friend_quiz_answers?: number[] | null
          friend_user_id: string
          id?: string
          last_interaction?: string | null
          match_score?: number | null
          owner_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          friend_birthday?: string | null
          friend_category?: string | null
          friend_description?: string | null
          friend_last_name?: string
          friend_name?: string
          friend_quiz_answers?: number[] | null
          friend_user_id?: string
          id?: string
          last_interaction?: string | null
          match_score?: number | null
          owner_id?: string
        }
        Relationships: []
      }
      game_words: {
        Row: {
          category: string | null
          created_at: string
          id: string
          word: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          word: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          word?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          code: string
          created_at: string
          id: string
          impostor_index: number
          player_count: number
          starting_player: number | null
          status: string
          views_count: number | null
          word_id: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          impostor_index: number
          player_count: number
          starting_player?: number | null
          status?: string
          views_count?: number | null
          word_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          impostor_index?: number
          player_count?: number
          starting_player?: number | null
          status?: string
          views_count?: number | null
          word_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "games_word_id_fkey"
            columns: ["word_id"]
            isOneToOne: false
            referencedRelation: "game_words"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          added_at: string
          friend_id: string
          group_id: string
          id: string
        }
        Insert: {
          added_at?: string
          friend_id: string
          group_id: string
          id?: string
        }
        Update: {
          added_at?: string
          friend_id?: string
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_messages: {
        Row: {
          content: string
          created_at: string
          group_id: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          group_id: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          group_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_messages_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      mafia_games: {
        Row: {
          code: string
          created_at: string
          id: string
          mafia_count: number
          player_count: number
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          mafia_count: number
          player_count: number
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          mafia_count?: number
          player_count?: number
          status?: string
        }
        Relationships: []
      }
      mafia_players: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_index: number
          role: string
          viewed_at: string | null
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_index: number
          role: string
          viewed_at?: string | null
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_index?: number
          role?: string
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mafia_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "mafia_games"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_participants: {
        Row: {
          added_at: string
          friend_id: string
          id: string
          meeting_id: string
          status: string | null
        }
        Insert: {
          added_at?: string
          friend_id: string
          id?: string
          meeting_id: string
          status?: string | null
        }
        Update: {
          added_at?: string
          friend_id?: string
          id?: string
          meeting_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_participants_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_participants_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          meeting_date: string
          meeting_time: string | null
          owner_id: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date: string
          meeting_time?: string | null
          owner_id: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          meeting_date?: string
          meeting_time?: string | null
          owner_id?: string
          title?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      parties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          owner_id: string
          party_date: string
          party_time: string | null
          party_type: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          owner_id: string
          party_date: string
          party_time?: string | null
          party_type?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          owner_id?: string
          party_date?: string
          party_time?: string | null
          party_type?: string
          title?: string
        }
        Relationships: []
      }
      party_external_invites: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          invite_code: string
          last_name: string | null
          party_id: string
          phone: string | null
          responded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          invite_code: string
          last_name?: string | null
          party_id: string
          phone?: string | null
          responded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          invite_code?: string
          last_name?: string | null
          party_id?: string
          phone?: string | null
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_external_invites_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      party_participants: {
        Row: {
          added_at: string
          friend_id: string
          id: string
          party_id: string
          responded_at: string | null
          status: string
        }
        Insert: {
          added_at?: string
          friend_id: string
          id?: string
          party_id: string
          responded_at?: string | null
          status?: string
        }
        Update: {
          added_at?: string
          friend_id?: string
          id?: string
          party_id?: string
          responded_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_participants_friend_id_fkey"
            columns: ["friend_id"]
            isOneToOne: false
            referencedRelation: "friends"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "party_participants_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verifications: {
        Row: {
          code: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      player_views: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_index: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_index: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_views_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          birthday: string | null
          category: string | null
          created_at: string
          description: string | null
          first_name: string
          id: string
          last_name: string
          quiz_answers: number[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birthday?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          first_name: string
          id?: string
          last_name: string
          quiz_answers?: number[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birthday?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          first_name?: string
          id?: string
          last_name?: string
          quiz_answers?: number[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: []
      }
      whoami_characters: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      whoami_games: {
        Row: {
          code: string
          created_at: string
          guesser_index: number
          id: string
          player_count: number
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          guesser_index: number
          id?: string
          player_count: number
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          guesser_index?: number
          id?: string
          player_count?: number
          status?: string
        }
        Relationships: []
      }
      whoami_players: {
        Row: {
          character_id: string | null
          created_at: string
          game_id: string
          guessed: boolean | null
          id: string
          player_index: number
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          game_id: string
          guessed?: boolean | null
          id?: string
          player_index: number
        }
        Update: {
          character_id?: string | null
          created_at?: string
          game_id?: string
          guessed?: boolean | null
          id?: string
          player_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "whoami_players_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "whoami_characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whoami_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "whoami_games"
            referencedColumns: ["id"]
          },
        ]
      }
      whoami_views: {
        Row: {
          created_at: string
          game_id: string
          id: string
          player_index: number
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          player_index: number
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          player_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "whoami_views_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "whoami_games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
