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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bank_accounts: {
        Row: {
          account_number: string | null
          bank_name: string | null
          branch: string | null
          created_at: string | null
          id: number
          institution_id: number | null
        }
        Insert: {
          account_number?: string | null
          bank_name?: string | null
          branch?: string | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
        }
        Update: {
          account_number?: string | null
          bank_name?: string | null
          branch?: string | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          author: string | null
          category: string | null
          condition: string | null
          created_at: string | null
          id: number
          institution_id: number | null
          isbn: string | null
          level: string | null
          publisher: string | null
          quantity: number | null
          subject: string | null
          title: string
          unit_price: string | null
          year_published: number | null
        }
        Insert: {
          author?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
          isbn?: string | null
          level?: string | null
          publisher?: string | null
          quantity?: number | null
          subject?: string | null
          title: string
          unit_price?: string | null
          year_published?: number | null
        }
        Update: {
          author?: string | null
          category?: string | null
          condition?: string | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
          isbn?: string | null
          level?: string | null
          publisher?: string | null
          quantity?: number | null
          subject?: string | null
          title?: string
          unit_price?: string | null
          year_published?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "books_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      capitation_receipts: {
        Row: {
          amount: number | null
          created_at: string | null
          date_received: string | null
          file_path: string | null
          id: number
          institution_id: number | null
          receipt_no: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          date_received?: string | null
          file_path?: string | null
          id?: number
          institution_id?: number | null
          receipt_no?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          date_received?: string | null
          file_path?: string | null
          id?: number
          institution_id?: number | null
          receipt_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "capitation_receipts_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      emergencies: {
        Row: {
          calamity_name: string | null
          created_at: string | null
          description: string | null
          id: number
          institution_id: number | null
          reporting_date: string | null
          response: string | null
          status: string | null
        }
        Insert: {
          calamity_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          institution_id?: number | null
          reporting_date?: string | null
          response?: string | null
          status?: string | null
        }
        Update: {
          calamity_name?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          institution_id?: number | null
          reporting_date?: string | null
          response?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergencies_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      infrastructure: {
        Row: {
          asset_name: string | null
          asset_type: string | null
          classification: string | null
          cost: number | null
          created_at: string | null
          id: number
          institution_id: number | null
          quantity: number | null
          year_of_acquisition: number | null
        }
        Insert: {
          asset_name?: string | null
          asset_type?: string | null
          classification?: string | null
          cost?: number | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
          quantity?: number | null
          year_of_acquisition?: number | null
        }
        Update: {
          asset_name?: string | null
          asset_type?: string | null
          classification?: string | null
          cost?: number | null
          created_at?: string | null
          id?: number
          institution_id?: number | null
          quantity?: number | null
          year_of_acquisition?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "infrastructure_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          category: string | null
          county: string | null
          created_at: string | null
          education_system: string | null
          geo_lat: string | null
          geo_lng: string | null
          id: number
          kra_pin: string | null
          level: string | null
          location: string | null
          name: string
          nearest_health: string | null
          nearest_police: string | null
          nearest_town: string | null
          ownership: string | null
          ownership_doc: string | null
          registration_date: string | null
          registration_no: string | null
          sbp_compliance: boolean | null
          subcounty: string | null
          type: string | null
          unique_code: string | null
          ward: string | null
          zone: string | null
        }
        Insert: {
          category?: string | null
          county?: string | null
          created_at?: string | null
          education_system?: string | null
          geo_lat?: string | null
          geo_lng?: string | null
          id?: number
          kra_pin?: string | null
          level?: string | null
          location?: string | null
          name: string
          nearest_health?: string | null
          nearest_police?: string | null
          nearest_town?: string | null
          ownership?: string | null
          ownership_doc?: string | null
          registration_date?: string | null
          registration_no?: string | null
          sbp_compliance?: boolean | null
          subcounty?: string | null
          type?: string | null
          unique_code?: string | null
          ward?: string | null
          zone?: string | null
        }
        Update: {
          category?: string | null
          county?: string | null
          created_at?: string | null
          education_system?: string | null
          geo_lat?: string | null
          geo_lng?: string | null
          id?: number
          kra_pin?: string | null
          level?: string | null
          location?: string | null
          name?: string
          nearest_health?: string | null
          nearest_police?: string | null
          nearest_town?: string | null
          ownership?: string | null
          ownership_doc?: string | null
          registration_date?: string | null
          registration_no?: string | null
          sbp_compliance?: boolean | null
          subcounty?: string | null
          type?: string | null
          unique_code?: string | null
          ward?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      learners: {
        Row: {
          admission_date: string | null
          cause_of_death: string | null
          created_at: string | null
          date_of_death: string | null
          death_details: string | null
          deceased: boolean | null
          dob: string | null
          first_name: string | null
          gender: string | null
          id: number
          institution_id: number | null
          last_name: string | null
          other_name: string | null
          photo: string | null
          status: string | null
          upi: string
        }
        Insert: {
          admission_date?: string | null
          cause_of_death?: string | null
          created_at?: string | null
          date_of_death?: string | null
          death_details?: string | null
          deceased?: boolean | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          photo?: string | null
          status?: string | null
          upi: string
        }
        Update: {
          admission_date?: string | null
          cause_of_death?: string | null
          created_at?: string | null
          date_of_death?: string | null
          death_details?: string | null
          deceased?: boolean | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          photo?: string | null
          status?: string | null
          upi?: string
        }
        Relationships: [
          {
            foreignKeyName: "learners_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          institution_id: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          institution_id?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          institution_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          admission_date: string | null
          cause_of_death: string | null
          created_at: string | null
          date_of_death: string | null
          death_details: string | null
          deceased: boolean | null
          dob: string | null
          first_name: string | null
          gender: string | null
          id: number
          institution_id: number | null
          last_name: string | null
          other_name: string | null
          photo: string | null
          status: string | null
          upi: string
        }
        Insert: {
          admission_date?: string | null
          cause_of_death?: string | null
          created_at?: string | null
          date_of_death?: string | null
          death_details?: string | null
          deceased?: boolean | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          photo?: string | null
          status?: string | null
          upi: string
        }
        Update: {
          admission_date?: string | null
          cause_of_death?: string | null
          created_at?: string | null
          date_of_death?: string | null
          death_details?: string | null
          deceased?: boolean | null
          dob?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          photo?: string | null
          status?: string | null
          upi?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      teachers: {
        Row: {
          created_at: string | null
          dob: string | null
          email: string | null
          first_name: string | null
          gender: string | null
          id: number
          institution_id: number | null
          last_name: string | null
          other_name: string | null
          phone: string | null
          photo: string | null
          tsc_no: string | null
        }
        Insert: {
          created_at?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          phone?: string | null
          photo?: string | null
          tsc_no?: string | null
        }
        Update: {
          created_at?: string | null
          dob?: string | null
          email?: string | null
          first_name?: string | null
          gender?: string | null
          id?: number
          institution_id?: number | null
          last_name?: string | null
          other_name?: string | null
          phone?: string | null
          photo?: string | null
          tsc_no?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teachers_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: number
          institution_id: number | null
          password_hash: string
          role: string
          username: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          institution_id?: number | null
          password_hash: string
          role: string
          username: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: number
          institution_id?: number | null
          password_hash?: string
          role?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_institution: {
        Args: { _user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "institution_admin" | "teacher" | "data_clerk"
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
      app_role: ["super_admin", "institution_admin", "teacher", "data_clerk"],
    },
  },
} as const
