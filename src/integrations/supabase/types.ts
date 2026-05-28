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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          question_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_id?: string
          user_id?: string
        }
        Relationships: []
      }
      chapters: {
        Row: {
          created_at: string
          id: string
          name: string
          number: number
          subject_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          number: number
          subject_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          number?: number
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chapters_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          content: string
          created_at: string
          id: string
          status: string
          student_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          status?: string
          student_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          status?: string
          student_id?: string
          type?: string
        }
        Relationships: []
      }
      exam_schedule: {
        Row: {
          created_at: string
          date: string
          exam_name: string
          id: string
          subject_id: string | null
        }
        Insert: {
          created_at?: string
          date: string
          exam_name: string
          id?: string
          subject_id?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          exam_name?: string
          id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_schedule_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      formula_sheets: {
        Row: {
          chapter_id: string
          created_at: string
          file_url: string
          id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          file_url: string
          id?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "formula_sheets_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      important_questions: {
        Row: {
          chapter_id: string
          created_at: string
          difficulty: string
          id: string
          question: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          difficulty?: string
          id?: string
          question: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          difficulty?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "important_questions_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          used_by?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          chapter_id: string
          created_at: string
          file_url: string
          id: string
          title: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          file_url: string
          id?: string
          title: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          file_url?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      one_pagers: {
        Row: {
          chapter_id: string
          created_at: string
          file_url: string
          id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          file_url: string
          id?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "one_pagers_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
      }
      past_papers: {
        Row: {
          created_at: string
          file_url: string
          id: string
          school_name: string
          subject_id: string
          year: number
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          school_name: string
          subject_id: string
          year: number
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          school_name?: string
          subject_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "past_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_papers: {
        Row: {
          created_at: string
          id: string
          questions_json: Json
          subject_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          questions_json?: Json
          subject_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          questions_json?: Json
          subject_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_papers_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          invite_code_used: string | null
          name: string
          section: string
        }
        Insert: {
          created_at?: string
          id: string
          invite_code_used?: string | null
          name: string
          section: string
        }
        Update: {
          created_at?: string
          id?: string
          invite_code_used?: string | null
          name?: string
          section?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      worksheets: {
        Row: {
          chapter_id: string
          created_at: string
          file_url: string
          id: string
        }
        Insert: {
          chapter_id: string
          created_at?: string
          file_url: string
          id?: string
        }
        Update: {
          chapter_id?: string
          created_at?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worksheets_chapter_id_fkey"
            columns: ["chapter_id"]
            isOneToOne: false
            referencedRelation: "chapters"
            referencedColumns: ["id"]
          },
        ]
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
      validate_invite_code: { Args: { _code: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "student"
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
      app_role: ["admin", "student"],
    },
  },
} as const
