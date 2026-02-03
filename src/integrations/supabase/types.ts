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
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          last_message_at: string | null
          listing_id: string | null
          seller_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string | null
          seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_one: string
          participant_two: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one: string
          participant_two: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_one?: string
          participant_two?: string
        }
        Relationships: []
      }
      fun_circle_friends: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      fun_circle_mentions: {
        Row: {
          created_at: string
          id: string
          mentioned_user_id: string
          story_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mentioned_user_id: string
          story_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mentioned_user_id?: string
          story_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_mentions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_messages: {
        Row: {
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          is_public: boolean | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      fun_circle_stories: {
        Row: {
          content: string | null
          created_at: string
          expires_at: string
          id: string
          images: string[] | null
          media_type: string | null
          media_url: string | null
          reactions_count: Json | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          images?: string[] | null
          media_type?: string | null
          media_url?: string | null
          reactions_count?: Json | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          images?: string[] | null
          media_type?: string | null
          media_url?: string | null
          reactions_count?: Json | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      fun_circle_story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_story_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_story_reactions_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      fun_circle_story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fun_circle_story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "fun_circle_stories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          job_count: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          job_count?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          job_count?: number
          name?: string
        }
        Relationships: []
      }
      job_submissions: {
        Row: {
          admin_feedback: string | null
          created_at: string
          id: string
          job_id: string
          payment_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_content: string
          submission_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          job_id: string
          payment_amount: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_content: string
          submission_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          job_id?: string
          payment_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_content?: string
          submission_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          category_id: string | null
          created_at: string
          current_submissions: number
          deadline: string | null
          description: string
          difficulty: Database["public"]["Enums"]["job_difficulty"]
          estimated_time: string | null
          id: string
          instructions: string
          is_active: boolean
          max_submissions: number | null
          payment_amount: number
          required_tier: Database["public"]["Enums"]["membership_tier"]
          submission_format: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_submissions?: number
          deadline?: string | null
          description: string
          difficulty?: Database["public"]["Enums"]["job_difficulty"]
          estimated_time?: string | null
          id?: string
          instructions: string
          is_active?: boolean
          max_submissions?: number | null
          payment_amount: number
          required_tier?: Database["public"]["Enums"]["membership_tier"]
          submission_format?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_submissions?: number
          deadline?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["job_difficulty"]
          estimated_time?: string | null
          id?: string
          instructions?: string
          is_active?: boolean
          max_submissions?: number | null
          payment_amount?: number
          required_tier?: Database["public"]["Enums"]["membership_tier"]
          submission_format?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          category: string | null
          created_at: string
          delivery_available: boolean | null
          description: string | null
          event_date: string | null
          favorites_count: number | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_free: boolean | null
          is_negotiable: boolean | null
          is_sponsored: boolean | null
          listing_type: string
          location: string
          original_price: number | null
          price: number | null
          sponsored_until: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
          views_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          delivery_available?: boolean | null
          description?: string | null
          event_date?: string | null
          favorites_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_negotiable?: boolean | null
          is_sponsored?: boolean | null
          listing_type?: string
          location?: string
          original_price?: number | null
          price?: number | null
          sponsored_until?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
          views_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          delivery_available?: boolean | null
          description?: string | null
          event_date?: string | null
          favorites_count?: number | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_free?: boolean | null
          is_negotiable?: boolean | null
          is_sponsored?: boolean | null
          listing_type?: string
          location?: string
          original_price?: number | null
          price?: number | null
          sponsored_until?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
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
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_earnings: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          daily_tasks_used: number
          email: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          last_task_reset_date: string
          location: string | null
          membership_expires_at: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          pending_earnings: number
          phone: string | null
          rating: number | null
          tasks_completed: number
          total_earnings: number
          updated_at: string
          username: string | null
        }
        Insert: {
          approved_earnings?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_tasks_used?: number
          email: string
          full_name?: string | null
          id: string
          is_verified?: boolean | null
          last_task_reset_date?: string
          location?: string | null
          membership_expires_at?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          pending_earnings?: number
          phone?: string | null
          rating?: number | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
          username?: string | null
        }
        Update: {
          approved_earnings?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          daily_tasks_used?: number
          email?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_task_reset_date?: string
          location?: string | null
          membership_expires_at?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          pending_earnings?: number
          phone?: string | null
          rating?: number | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sponsor_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          duration_days: number
          id: string
          listing_id: string
          requested_at: string
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          duration_days?: number
          id?: string
          listing_id: string
          requested_at?: string
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          duration_days?: number
          id?: string
          listing_id?: string
          requested_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsor_requests_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "freelancer"
      job_difficulty: "easy" | "medium" | "hard"
      membership_tier: "none" | "regular" | "pro" | "vip"
      submission_status: "pending" | "approved" | "rejected"
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
    Enums: {
      app_role: ["admin", "freelancer"],
      job_difficulty: ["easy", "medium", "hard"],
      membership_tier: ["none", "regular", "pro", "vip"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
