export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "participant" | "admin";

export type RegistrationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "WAITLISTED"
  | "OFFERED"
  | "CANCELLED"
  | "EXPIRED"
  | "SKIPPED";

export type OfferStatus =
  | "ACTIVE"
  | "CLAIMED"
  | "EXPIRED"
  | "DECLINED"
  | "CANCELLED";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          college_id: string;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          college_id: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          college_id?: string;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          date: string;
          start_time: string;
          end_time: string;
          venue: string;
          capacity: number;
          status: string;
          theme: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          date: string;
          start_time: string;
          end_time: string;
          venue: string;
          capacity?: number;
          status?: string;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          date?: string;
          start_time?: string;
          end_time?: string;
          venue?: string;
          capacity?: number;
          status?: string;
          theme?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      registrations: {
        Row: {
          id: string;
          event_id: string;
          user_id: string | null;
          crew_name: string;
          captain_name: string;
          captain_email: string;
          captain_phone: string;
          college_id: string;
          crew_size: number;
          status: RegistrationStatus;
          queue_position: number | null;
          created_at: string;
          updated_at: string;
          confirmed_at: string | null;
          cancelled_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id?: string | null;
          crew_name: string;
          captain_name: string;
          captain_email: string;
          captain_phone: string;
          college_id: string;
          crew_size: number;
          status?: RegistrationStatus;
          queue_position?: number | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          user_id?: string | null;
          crew_name?: string;
          captain_name?: string;
          captain_email?: string;
          captain_phone?: string;
          college_id?: string;
          crew_size?: number;
          status?: RegistrationStatus;
          queue_position?: number | null;
          created_at?: string;
          updated_at?: string;
          confirmed_at?: string | null;
          cancelled_at?: string | null;
        };
      };
      crew_members: {
        Row: {
          id: string;
          registration_id: string;
          name: string;
          email: string | null;
          college_id: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          registration_id: string;
          name: string;
          email?: string | null;
          college_id?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          registration_id?: string;
          name?: string;
          email?: string | null;
          college_id?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      berth_offers: {
        Row: {
          id: string;
          event_id: string;
          registration_id: string;
          created_at: string;
          expires_at: string;
          status: OfferStatus;
          claimed_at: string | null;
          expired_at: string | null;
          declined_at: string | null;
        };
        Insert: {
          id?: string;
          event_id: string;
          registration_id: string;
          created_at?: string;
          expires_at?: string;
          status?: OfferStatus;
          claimed_at?: string | null;
          expired_at?: string | null;
          declined_at?: string | null;
        };
        Update: {
          id?: string;
          event_id?: string;
          registration_id?: string;
          created_at?: string;
          expires_at?: string;
          status?: OfferStatus;
          claimed_at?: string | null;
          expired_at?: string | null;
          declined_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          event_id: string | null;
          registration_id: string | null;
          type: string;
          message: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id?: string | null;
          registration_id?: string | null;
          type: string;
          message: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string | null;
          registration_id?: string | null;
          type?: string;
          message?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
    };
    Functions: {
      promote_next_waitlist_crew: {
        Args: { p_event_id: string };
        Returns: string | null;
      };
      claim_berth_offer: {
        Args: { p_offer_id: string };
        Returns: boolean;
      };
      abandon_voyage: {
        Args: { p_registration_id: string };
        Returns: boolean;
      };
      expire_berth_offer: {
        Args: { p_offer_id: string };
        Returns: boolean;
      };
      process_expired_offers: {
        Args: Record<string, never>;
        Returns: number;
      };
      register_crew: {
        Args: {
          p_event_id: string;
          p_crew_name: string;
          p_captain_name: string;
          p_captain_email: string;
          p_captain_phone: string;
          p_college_id: string;
          p_crew_size: number;
          p_members?: Json;
        };
        Returns: Json;
      };
      reset_demo_event: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
  };
}
