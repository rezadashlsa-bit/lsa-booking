// Hand-written to match supabase/migrations/0001_init_schema.sql and 0002_rls_policies.sql.
// Regenerate with `supabase gen types typescript` once a live project exists, and keep
// this file in sync if the schema changes before then.

export type UserRole = "admin" | "coach" | "parent";
export type StudentType = "hp" | "general";
export type EligibilityType = "open_all" | "hp_only" | "general_only" | "named_only";
export type BookingType = "makeup" | "additional" | "open_hour";
export type BookingStatus = "booked" | "completed" | "missed" | "cancelled";
export type SlotStatus = "open" | "booked" | "cancelled" | "blocked";

export interface Database {
  public: {
    Tables: {
      coaches: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["coaches"]["Insert"]>;
        Relationships: [];
      };
      families: {
        Row: {
          id: string;
          primary_parent_name: string;
          primary_parent_email: string;
          secondary_parent_name: string | null;
          secondary_parent_email: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          primary_parent_name: string;
          primary_parent_email: string;
          secondary_parent_name?: string | null;
          secondary_parent_email?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["families"]["Insert"]>;
        Relationships: [];
      };
      students: {
        Row: {
          id: string;
          family_id: string;
          name: string;
          type: StudentType;
          grade: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_id: string;
          name: string;
          type: StudentType;
          grade?: string | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "students_family_id_fkey";
            columns: ["family_id"];
            isOneToOne: false;
            referencedRelation: "families";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          role: UserRole;
          coach_id: string | null;
          family_id: string | null;
          full_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          role: UserRole;
          coach_id?: string | null;
          family_id?: string | null;
          full_name?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      admin_allowlist: {
        Row: { email: string };
        Insert: { email: string };
        Update: { email?: string };
        Relationships: [];
      };
      availability_templates: {
        Row: {
          id: string;
          coach_id: string;
          day_of_week: number;
          start_time_local: string;
          end_time_local: string;
          eligibility_type: EligibilityType;
          active: boolean;
          effective_from: string;
          effective_until: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          day_of_week: number;
          start_time_local: string;
          end_time_local: string;
          eligibility_type?: EligibilityType;
          active?: boolean;
          effective_from?: string;
          effective_until?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability_templates"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "availability_templates_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "coaches";
            referencedColumns: ["id"];
          },
        ];
      };
      availability_template_students: {
        Row: { template_id: string; student_id: string };
        Insert: { template_id: string; student_id: string };
        Update: { template_id?: string; student_id?: string };
        Relationships: [];
      };
      slot_instances: {
        Row: {
          id: string;
          template_id: string | null;
          coach_id: string;
          starts_at: string;
          ends_at: string;
          eligibility_type: EligibilityType;
          status: SlotStatus;
          is_override: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_id?: string | null;
          coach_id: string;
          starts_at: string;
          ends_at: string;
          eligibility_type: EligibilityType;
          status?: SlotStatus;
          is_override?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["slot_instances"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "slot_instances_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "coaches";
            referencedColumns: ["id"];
          },
        ];
      };
      slot_instance_students: {
        Row: { slot_instance_id: string; student_id: string };
        Insert: { slot_instance_id: string; student_id: string };
        Update: { slot_instance_id?: string; student_id?: string };
        Relationships: [
          {
            foreignKeyName: "slot_instance_students_slot_instance_id_fkey";
            columns: ["slot_instance_id"];
            isOneToOne: false;
            referencedRelation: "slot_instances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "slot_instance_students_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          slot_instance_id: string;
          student_id: string;
          type: BookingType;
          status: BookingStatus;
          makeup_for_missed_session_id: string | null;
          created_by: string;
          created_at: string;
          cancelled_at: string | null;
          cancelled_by: string | null;
          cancellation_reason: string | null;
        };
        Insert: {
          id?: string;
          slot_instance_id: string;
          student_id: string;
          type: BookingType;
          status?: BookingStatus;
          makeup_for_missed_session_id?: string | null;
          created_by: string;
          created_at?: string;
          cancelled_at?: string | null;
          cancelled_by?: string | null;
          cancellation_reason?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "bookings_slot_instance_id_fkey";
            columns: ["slot_instance_id"];
            isOneToOne: false;
            referencedRelation: "slot_instances";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      missed_sessions: {
        Row: {
          id: string;
          student_id: string;
          original_booking_id: string;
          original_slot_instance_id: string;
          logged_by: string;
          occurred_at: string;
          reason: string | null;
          notice_given: boolean;
          makeup_booking_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          original_booking_id: string;
          original_slot_instance_id: string;
          logged_by: string;
          occurred_at: string;
          reason?: string | null;
          notice_given: boolean;
          makeup_booking_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["missed_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "missed_sessions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      email_log: {
        Row: {
          id: string;
          type: string;
          recipient_email: string;
          related_booking_id: string | null;
          related_missed_session_id: string | null;
          resend_message_id: string | null;
          status: string;
          error: string | null;
          sent_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          recipient_email: string;
          related_booking_id?: string | null;
          related_missed_session_id?: string | null;
          resend_message_id?: string | null;
          status?: string;
          error?: string | null;
          sent_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_log"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ensure_profile: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["profiles"]["Row"] | null;
      };
      get_my_profile: {
        Args: Record<string, never>;
        Returns: Database["public"]["Tables"]["profiles"]["Row"] | null;
      };
      book_slot: {
        Args: {
          p_slot_instance_id: string;
          p_student_id: string;
          p_booking_type: BookingType;
          p_missed_session_id?: string | null;
        };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      cancel_booking: {
        Args: { p_booking_id: string; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      mark_booking_complete: {
        Args: { p_booking_id: string };
        Returns: Database["public"]["Tables"]["bookings"]["Row"];
      };
      log_missed_session: {
        Args: { p_booking_id: string; p_notice_given: boolean; p_reason?: string | null };
        Returns: Database["public"]["Tables"]["missed_sessions"]["Row"];
      };
    };
    Enums: {
      user_role: UserRole;
      student_type: StudentType;
      eligibility_type: EligibilityType;
      booking_type: BookingType;
      booking_status: BookingStatus;
      slot_status: SlotStatus;
    };
  };
}
