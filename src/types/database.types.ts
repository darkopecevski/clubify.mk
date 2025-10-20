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
      users: {
        Row: {
          id: string
          full_name: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          contact_email: string | null
          contact_phone: string | null
          address: string | null
          city: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          address?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          club_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          club_id?: string | null
          role: Database["public"]["Enums"]["user_role"]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          club_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      teams: {
        Row: {
          id: string
          club_id: string
          name: string
          age_group: string
          season: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          name: string
          age_group: string
          season?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          name?: string
          age_group?: string
          season?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      players: {
        Row: {
          id: string
          club_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          position: string | null
          dominant_foot: string | null
          jersey_number: number | null
          blood_type: string | null
          medical_conditions: string | null
          allergies: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          photo_url: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: string
          position?: string | null
          dominant_foot?: string | null
          jersey_number?: number | null
          blood_type?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          emergency_contact_name: string
          emergency_contact_phone: string
          emergency_contact_relationship: string
          photo_url?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: string
          position?: string | null
          dominant_foot?: string | null
          jersey_number?: number | null
          blood_type?: string | null
          medical_conditions?: string | null
          allergies?: string | null
          emergency_contact_name?: string
          emergency_contact_phone?: string
          emergency_contact_relationship?: string
          photo_url?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          }
        ]
      }
      player_parents: {
        Row: {
          id: string
          player_id: string
          parent_user_id: string
          relationship: string
          created_at: string
        }
        Insert: {
          id?: string
          player_id: string
          parent_user_id: string
          relationship: string
          created_at?: string
        }
        Update: {
          id?: string
          player_id?: string
          parent_user_id?: string
          relationship?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_parents_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_parents_parent_user_id_fkey"
            columns: ["parent_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_players: {
        Row: {
          id: string
          team_id: string
          player_id: string
          joined_at: string
          left_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          player_id: string
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          player_id?: string
          joined_at?: string
          left_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          }
        ]
      }
      coaches: {
        Row: {
          id: string
          club_id: string
          user_id: string
          license_type: string | null
          license_number: string | null
          specialization: string | null
          years_of_experience: number | null
          bio: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          club_id: string
          user_id: string
          license_type?: string | null
          license_number?: string | null
          specialization?: string | null
          years_of_experience?: number | null
          bio?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          club_id?: string
          user_id?: string
          license_type?: string | null
          license_number?: string | null
          specialization?: string | null
          years_of_experience?: number | null
          bio?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaches_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coaches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      team_coaches: {
        Row: {
          id: string
          team_id: string
          coach_id: string
          role: string
          assigned_at: string
          removed_at: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          coach_id: string
          role: string
          assigned_at?: string
          removed_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          coach_id?: string
          role?: string
          assigned_at?: string
          removed_at?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_coaches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_coaches_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      user_club_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      user_has_club_role: {
        Args: {
          check_role: Database["public"]["Enums"]["user_role"]
          check_club_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "super_admin" | "club_admin" | "coach" | "parent" | "player"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]

export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T]
