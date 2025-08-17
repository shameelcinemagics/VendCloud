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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      machine_products: {
        Row: {
          active: boolean
          created_at: string
          id: string
          price: number
          product_id: string
          updated_at: string
          vending_machine_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          price: number
          product_id: string
          updated_at?: string
          vending_machine_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          price?: number
          product_id?: string
          updated_at?: string
          vending_machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_machine_products_machine"
            columns: ["vending_machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_machine_products_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          calories: number | null
          carbs: number | null
          category: string | null
          created_at: string
          fat: number | null
          health_rating: number | null
          id: string
          image_url: string | null
          ingredients: string | null
          name: string
          price: string
          protein: number | null
          sodium: number | null
        }
        Insert: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string
          fat?: number | null
          health_rating?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          name: string
          price: string
          protein?: number | null
          sodium?: number | null
        }
        Update: {
          calories?: number | null
          carbs?: number | null
          category?: string | null
          created_at?: string
          fat?: number | null
          health_rating?: number | null
          id?: string
          image_url?: string | null
          ingredients?: string | null
          name?: string
          price?: string
          protein?: number | null
          sodium?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          id: string
          product_id: string
          quantity: number
          slot_number: number
          sold_at: string
          unit_price: number | null
          vending_machine_id: string
        }
        Insert: {
          id?: string
          product_id: string
          quantity?: number
          slot_number: number
          sold_at?: string
          unit_price?: number | null
          vending_machine_id: string
        }
        Update: {
          id?: string
          product_id?: string
          quantity?: number
          slot_number?: number
          sold_at?: string
          unit_price?: number | null
          vending_machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_vending_machine_id_fkey"
            columns: ["vending_machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      slots: {
        Row: {
          created_at: string
          id: string
          max_capacity: number
          product_id: string | null
          quantity: number
          slot_number: number
          vending_machine_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          max_capacity?: number
          product_id?: string | null
          quantity?: number
          slot_number: number
          vending_machine_id: string
        }
        Update: {
          created_at?: string
          id?: string
          max_capacity?: number
          product_id?: string | null
          quantity?: number
          slot_number?: number
          vending_machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "slots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slots_vending_machine_id_fkey"
            columns: ["vending_machine_id"]
            isOneToOne: false
            referencedRelation: "vending_machines"
            referencedColumns: ["id"]
          },
        ]
      }
      vending_machines: {
        Row: {
          created_at: string
          id: string
          location: string
          machine_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          location: string
          machine_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          machine_id?: string
          status?: string
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
