export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          approved: boolean
          candidate_id: string
          created_at: string
          hold: boolean
          id: string
          interview_failed: boolean
          interview_request: boolean
          job_id: string
          offer: boolean
          pending_approval: boolean
          placed: boolean
          preparing: boolean
          status: string
          submitted: boolean
          updated_at: string
        }
        Insert: {
          approved?: boolean
          candidate_id: string
          created_at?: string
          hold?: boolean
          id?: string
          interview_failed?: boolean
          interview_request?: boolean
          job_id: string
          offer?: boolean
          pending_approval?: boolean
          placed?: boolean
          preparing?: boolean
          status?: string
          submitted?: boolean
          updated_at?: string
        }
        Update: {
          approved?: boolean
          candidate_id?: string
          created_at?: string
          hold?: boolean
          id?: string
          interview_failed?: boolean
          interview_request?: boolean
          job_id?: string
          offer?: boolean
          pending_approval?: boolean
          placed?: boolean
          preparing?: boolean
          status?: string
          submitted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          linkedin_url: string | null
          thread_ids: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          linkedin_url?: string | null
          thread_ids?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          linkedin_url?: string | null
          thread_ids?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          abbreviation: string
          created_at: string
          description: string
          id: string
          manager: string
          name: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          description: string
          id?: string
          manager: string
          name: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          description?: string
          id?: string
          manager?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      flavors: {
        Row: {
          created_at: string
          id: string
          label: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      gmail_tokens: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string
          id: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at: string
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string
          id?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_statuses: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          candidate_facing_title: string
          client: string
          client_id: string | null
          comp_desc: string
          created_at: string
          date: string
          flavor: string
          flavor_id: string | null
          high_rate: number
          id: string
          internal_title: string
          jd: string
          linkedin_search: string
          lir: string
          locale: string
          locale_id: string | null
          low_rate: number
          m1: string
          m2: string
          m3: string
          medium_rate: number
          min_skills: string
          other: string | null
          owner: string
          owner_id: string | null
          pay_details: string
          rate: number
          screening_questions: string
          skills_sought: string
          status: string
          status_id: string | null
          updated_at: string
          video_questions: string
          work_details: string
        }
        Insert: {
          candidate_facing_title: string
          client: string
          client_id?: string | null
          comp_desc: string
          created_at?: string
          date: string
          flavor: string
          flavor_id?: string | null
          high_rate: number
          id?: string
          internal_title: string
          jd: string
          linkedin_search: string
          lir: string
          locale: string
          locale_id?: string | null
          low_rate: number
          m1: string
          m2: string
          m3: string
          medium_rate: number
          min_skills: string
          other?: string | null
          owner: string
          owner_id?: string | null
          pay_details: string
          rate: number
          screening_questions: string
          skills_sought: string
          status: string
          status_id?: string | null
          updated_at?: string
          video_questions: string
          work_details: string
        }
        Update: {
          candidate_facing_title?: string
          client?: string
          client_id?: string | null
          comp_desc?: string
          created_at?: string
          date?: string
          flavor?: string
          flavor_id?: string | null
          high_rate?: number
          id?: string
          internal_title?: string
          jd?: string
          linkedin_search?: string
          lir?: string
          locale?: string
          locale_id?: string | null
          low_rate?: number
          m1?: string
          m2?: string
          m3?: string
          medium_rate?: number
          min_skills?: string
          other?: string | null
          owner?: string
          owner_id?: string | null
          pay_details?: string
          rate?: number
          screening_questions?: string
          skills_sought?: string
          status?: string
          status_id?: string | null
          updated_at?: string
          video_questions?: string
          work_details?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_job_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_flavor"
            columns: ["flavor_id"]
            isOneToOne: false
            referencedRelation: "flavors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_locale"
            columns: ["locale_id"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_owner"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job_status"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "job_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      locales: {
        Row: {
          abbreviation: string | null
          created_at: string
          id: string
          name: string
          pay_details: string | null
          updated_at: string
          work_details: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          name: string
          pay_details?: string | null
          updated_at?: string
          work_details?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string
          id?: string
          name?: string
          pay_details?: string | null
          updated_at?: string
          work_details?: string | null
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          created_at: string
          id: number
          m1_template: string
          m2_template: string
          m3_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: number
          m1_template: string
          m2_template: string
          m3_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          m1_template?: string
          m2_template?: string
          m3_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          created_at: string
          description: string
          id: number
          name: string
          prompt_text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: number
          name: string
          prompt_text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: number
          name?: string
          prompt_text?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_abbreviations: {
        Row: {
          abbreviation: string
          created_at: string
          id: string
          role_name: string
          updated_at: string
        }
        Insert: {
          abbreviation: string
          created_at?: string
          id?: string
          role_name: string
          updated_at?: string
        }
        Update: {
          abbreviation?: string
          created_at?: string
          id?: string
          role_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_gmail_token: {
        Args: { user_id_param: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
