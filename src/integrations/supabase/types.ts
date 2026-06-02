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
      ai_appointment_requests: {
        Row: {
          clinic_id: string | null
          conversation: Json | null
          created_at: string
          full_name: string
          id: string
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          problem: string | null
          status: Database["public"]["Enums"]["ai_request_status"]
          updated_at: string
        }
        Insert: {
          clinic_id?: string | null
          conversation?: Json | null
          created_at?: string
          full_name: string
          id?: string
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          problem?: string | null
          status?: Database["public"]["Enums"]["ai_request_status"]
          updated_at?: string
        }
        Update: {
          clinic_id?: string | null
          conversation?: Json | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          problem?: string | null
          status?: Database["public"]["Enums"]["ai_request_status"]
          updated_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          clinic_id: string
          created_at: string
          doctor_id: string | null
          ends_at: string | null
          id: string
          notes: string | null
          patient_id: string
          service_type: string | null
          starts_at: string
          status: Database["public"]["Enums"]["appointment_status"]
        }
        Insert: {
          clinic_id: string
          created_at?: string
          doctor_id?: string | null
          ends_at?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          service_type?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Update: {
          clinic_id?: string
          created_at?: string
          doctor_id?: string | null
          ends_at?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          service_type?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          city: string
          created_at: string
          doctors_count: number
          id: string
          logo_url: string | null
          name: string
          owner_name: string
          phone: string
          status: Database["public"]["Enums"]["clinic_status"]
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string
          working_hours: Json | null
        }
        Insert: {
          city: string
          created_at?: string
          doctors_count?: number
          id?: string
          logo_url?: string | null
          name: string
          owner_name: string
          phone: string
          status?: Database["public"]["Enums"]["clinic_status"]
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          working_hours?: Json | null
        }
        Update: {
          city?: string
          created_at?: string
          doctors_count?: number
          id?: string
          logo_url?: string | null
          name?: string
          owner_name?: string
          phone?: string
          status?: Database["public"]["Enums"]["clinic_status"]
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string
          working_hours?: Json | null
        }
        Relationships: []
      }
      dental_records: {
        Row: {
          after_image_url: string | null
          before_image_url: string | null
          clinic_id: string
          cost: number | null
          created_at: string
          doctor_id: string | null
          id: string
          notes: string | null
          patient_id: string
          procedure: Database["public"]["Enums"]["tooth_procedure"]
          tooth_number: number
        }
        Insert: {
          after_image_url?: string | null
          before_image_url?: string | null
          clinic_id: string
          cost?: number | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          procedure: Database["public"]["Enums"]["tooth_procedure"]
          tooth_number: number
        }
        Update: {
          after_image_url?: string | null
          before_image_url?: string | null
          clinic_id?: string
          cost?: number | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          procedure?: Database["public"]["Enums"]["tooth_procedure"]
          tooth_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "dental_records_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_records_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          active: boolean
          clinic_id: string
          created_at: string
          full_name: string
          id: string
          phone: string | null
          salary_percentage: number
          schedule: Json | null
          specialty: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          clinic_id: string
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          salary_percentage?: number
          schedule?: Json | null
          specialty?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          clinic_id?: string
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          salary_percentage?: number
          schedule?: Json | null
          specialty?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctors_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          category: string | null
          clinic_id: string
          created_at: string
          expiration_date: string | null
          id: string
          low_stock_threshold: number | null
          name: string
          purchase_price: number | null
          quantity: number
          supplier: string | null
          unit: string | null
        }
        Insert: {
          category?: string | null
          clinic_id: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          name: string
          purchase_price?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
        }
        Update: {
          category?: string | null
          clinic_id?: string
          created_at?: string
          expiration_date?: string | null
          id?: string
          low_stock_threshold?: number | null
          name?: string
          purchase_price?: number | null
          quantity?: number
          supplier?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_content: {
        Row: {
          content: Json
          id: number
          updated_at: string
        }
        Insert: {
          content?: Json
          id?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address: string | null
          allergies: string | null
          birth_date: string | null
          clinic_id: string
          created_at: string
          debt: number
          full_name: string
          gender: string | null
          id: string
          last_visit_at: string | null
          medical_conditions: string | null
          notes: string | null
          phone: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          clinic_id: string
          created_at?: string
          debt?: number
          full_name: string
          gender?: string | null
          id?: string
          last_visit_at?: string | null
          medical_conditions?: string | null
          notes?: string | null
          phone: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          allergies?: string | null
          birth_date?: string | null
          clinic_id?: string
          created_at?: string
          debt?: number
          full_name?: string
          gender?: string | null
          id?: string
          last_visit_at?: string | null
          medical_conditions?: string | null
          notes?: string | null
          phone?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          appointment_id: string | null
          clinic_id: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          patient_id: string
        }
        Insert: {
          amount: number
          appointment_id?: string | null
          clinic_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          patient_id: string
        }
        Update: {
          amount?: number
          appointment_id?: string | null
          clinic_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      belongs_to_clinic: {
        Args: { _clinic_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      user_clinic_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      ai_request_status: "new" | "called" | "booked" | "rejected"
      app_role:
        | "super_admin"
        | "owner"
        | "admin"
        | "doctor"
        | "reception"
        | "warehouse"
        | "accountant"
      appointment_status: "waiting" | "in_treatment" | "completed" | "cancelled"
      clinic_status: "pending" | "approved" | "blocked" | "suspended"
      payment_method: "cash" | "card" | "click" | "payme" | "bank_transfer"
      subscription_plan: "trial" | "starter" | "pro" | "enterprise"
      tooth_procedure:
        | "healthy"
        | "filling"
        | "root_canal"
        | "crown"
        | "implant"
        | "extraction"
        | "whitening"
        | "braces"
        | "missing"
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
      ai_request_status: ["new", "called", "booked", "rejected"],
      app_role: [
        "super_admin",
        "owner",
        "admin",
        "doctor",
        "reception",
        "warehouse",
        "accountant",
      ],
      appointment_status: ["waiting", "in_treatment", "completed", "cancelled"],
      clinic_status: ["pending", "approved", "blocked", "suspended"],
      payment_method: ["cash", "card", "click", "payme", "bank_transfer"],
      subscription_plan: ["trial", "starter", "pro", "enterprise"],
      tooth_procedure: [
        "healthy",
        "filling",
        "root_canal",
        "crown",
        "implant",
        "extraction",
        "whitening",
        "braces",
        "missing",
      ],
    },
  },
} as const
