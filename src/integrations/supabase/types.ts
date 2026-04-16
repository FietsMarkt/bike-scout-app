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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bikes: {
        Row: {
          brand: string
          city: string
          created_at: string
          description: string | null
          id: string
          images: string[]
          km: number | null
          model: string
          motor: string | null
          previous_price: number | null
          price: number
          status: string
          subtitle: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
          view_count: number
          year: number
        }
        Insert: {
          brand: string
          city: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          km?: number | null
          model: string
          motor?: string | null
          previous_price?: number | null
          price: number
          status?: string
          subtitle?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
          view_count?: number
          year: number
        }
        Update: {
          brand?: string
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[]
          km?: number | null
          model?: string
          motor?: string | null
          previous_price?: number | null
          price?: number
          status?: string
          subtitle?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          view_count?: number
          year?: number
        }
        Relationships: []
      }
      conversations: {
        Row: {
          bike_id: string
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string
          seller_id: string
        }
        Insert: {
          bike_id: string
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string
          seller_id: string
        }
        Update: {
          bike_id?: string
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          bike_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          bike_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          bike_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_bike_id_fkey"
            columns: ["bike_id"]
            isOneToOne: false
            referencedRelation: "bikes"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_suggestions: {
        Row: {
          brand: string
          cache_key: string
          created_at: string
          expires_at: string
          id: string
          km_bucket: number
          max_price: number
          min_price: number
          model: string
          reasoning: string
          recommended_price: number
          sample_size: number
          type: string
          year_bucket: number
        }
        Insert: {
          brand: string
          cache_key: string
          created_at?: string
          expires_at?: string
          id?: string
          km_bucket: number
          max_price: number
          min_price: number
          model: string
          reasoning: string
          recommended_price: number
          sample_size?: number
          type: string
          year_bucket: number
        }
        Update: {
          brand?: string
          cache_key?: string
          created_at?: string
          expires_at?: string
          id?: string
          km_bucket?: number
          max_price?: number
          min_price?: number
          model?: string
          reasoning?: string
          recommended_price?: number
          sample_size?: number
          type?: string
          year_bucket?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          is_dealer: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_dealer?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_dealer?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          id: string
          last_used_at: string
          p256dh: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          id?: string
          last_used_at?: string
          p256dh: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          id?: string
          last_used_at?: string
          p256dh?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_checked_at: string
          name: string
          notify_email: boolean
          notify_push: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          last_checked_at?: string
          name: string
          notify_email?: boolean
          notify_push?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_checked_at?: string
          name?: string
          notify_email?: boolean
          notify_push?: boolean
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          is_dealer: boolean | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_dealer?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_dealer?: boolean | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
