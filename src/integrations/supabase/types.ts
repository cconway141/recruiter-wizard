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
      candidates: {
        Row: {
          approved: boolean
          created_at: string
          id: string
          interviewing: boolean
          job_id: string
          name: string
          offered: boolean
          preparing: boolean
          submitted: boolean
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          id?: string
          interviewing?: boolean
          job_id: string
          name: string
          offered?: boolean
          preparing?: boolean
          submitted?: boolean
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          id?: string
          interviewing?: boolean
          job_id?: string
          name?: string
          offered?: boolean
          preparing?: boolean
          submitted?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          candidate_facing_title: string
          client: string
          comp_desc: string
          created_at: string
          date: string
          flavor: string
          high_rate: number
          id: string
          internal_title: string
          jd: string
          linkedin_search: string
          lir: string
          locale: string
          low_rate: number
          m1: string
          m2: string
          m3: string
          medium_rate: number
          min_skills: string
          other: string | null
          owner: string
          pay_details: string
          rate: number
          screening_questions: string
          skills_sought: string
          status: string
          updated_at: string
          video_questions: string
          work_details: string
        }
        Insert: {
          candidate_facing_title: string
          client: string
          comp_desc: string
          created_at?: string
          date: string
          flavor: string
          high_rate: number
          id?: string
          internal_title: string
          jd: string
          linkedin_search: string
          lir: string
          locale: string
          low_rate: number
          m1: string
          m2: string
          m3: string
          medium_rate: number
          min_skills: string
          other?: string | null
          owner: string
          pay_details: string
          rate: number
          screening_questions: string
          skills_sought: string
          status: string
          updated_at?: string
          video_questions: string
          work_details: string
        }
        Update: {
          candidate_facing_title?: string
          client?: string
          comp_desc?: string
          created_at?: string
          date?: string
          flavor?: string
          high_rate?: number
          id?: string
          internal_title?: string
          jd?: string
          linkedin_search?: string
          lir?: string
          locale?: string
          low_rate?: number
          m1?: string
          m2?: string
          m3?: string
          medium_rate?: number
          min_skills?: string
          other?: string | null
          owner?: string
          pay_details?: string
          rate?: number
          screening_questions?: string
          skills_sought?: string
          status?: string
          updated_at?: string
          video_questions?: string
          work_details?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
