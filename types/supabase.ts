export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          emoji: string
          color: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          emoji: string
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          emoji?: string
          color?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          description: string | null
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          description?: string | null
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          current_amount: number
          emoji: string | null
          deadline: string | null
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          current_amount?: number
          emoji?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          current_amount?: number
          emoji?: string | null
          deadline?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          monthly_limit: number
          month: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          monthly_limit: number
          month: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          monthly_limit?: number
          month?: string
          created_at?: string
        }
      }
    }
  }
}
