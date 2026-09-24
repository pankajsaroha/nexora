export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      institutions: {
        Row: {
          id: string;
          name: string;
          code: string;
          slug: string;
          logo_url: string | null;
          type: "SCHOOL" | "COLLEGE" | "UNIVERSITY";
          email: string;
          phone: string;
          website: string | null;
          address: string;
          city: string;
          state: string;
          pincode: string;
          country: string;
          timezone: string;
          currency: string;
          currency_symbol: string;
          working_days: string;
          working_hours: string;
          branding_color: string;
          status: "ACTIVE" | "INACTIVE" | "PENDING";
          is_demo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["institutions"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["institutions"]["Insert"]>;
      };
      academic_years: {
        Row: {
          id: string;
          institution_id: string;
          name: string;
          start_date: string;
          end_date: string;
          is_current: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["academic_years"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["academic_years"]["Insert"]>;
      };
      terms: {
        Row: {
          id: string;
          academic_year_id: string;
          institution_id: string;
          name: string;
          sequence: number;
          start_date: string;
          end_date: string;
          is_current: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["terms"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["terms"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          auth_user_id: string | null;
          institution_id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          role_code: string;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      students: {
        Row: {
          id: string;
          institution_id: string;
          user_id: string | null;
          admission_number: string;
          roll_number: string | null;
          first_name: string;
          last_name: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          date_of_birth: string;
          gender: "MALE" | "FEMALE" | "OTHER";
          blood_group: string | null;
          photo_url: string | null;
          current_class_id: string;
          current_section_id: string;
          academic_year_id: string;
          status: "ACTIVE" | "INACTIVE" | "ALUMNI" | "SUSPENDED";
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["students"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["students"]["Insert"]>;
      };
      teachers: {
        Row: {
          id: string;
          institution_id: string;
          user_id: string | null;
          employee_id: string;
          first_name: string;
          last_name: string;
          full_name: string;
          email: string;
          phone: string;
          designation: string;
          department_id: string | null;
          qualification: string | null;
          joining_date: string;
          employment_status: "ACTIVE" | "ON_LEAVE" | "RESIGNED";
          basic_salary: number;
          casual_leave_balance: number;
          sick_leave_balance: number;
          earned_leave_balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["teachers"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["teachers"]["Insert"]>;
      };
      guardians: {
        Row: {
          id: string;
          institution_id: string;
          user_id: string | null;
          full_name: string;
          relation: string;
          phone: string;
          email: string | null;
          occupation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["guardians"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guardians"]["Insert"]>;
      };
      student_guardians: {
        Row: {
          id: string;
          student_id: string;
          guardian_id: string;
          is_primary: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["student_guardians"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["student_guardians"]["Insert"]>;
      };
      classes: {
        Row: {
          id: string;
          institution_id: string;
          academic_year_id: string;
          name: string;
          code: string;
          level: string;
          order_index: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["classes"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["classes"]["Insert"]>;
      };
      sections: {
        Row: {
          id: string;
          class_id: string;
          name: string;
          room_number: string | null;
          capacity: number;
          class_teacher_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sections"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["sections"]["Insert"]>;
      };
      student_attendance: {
        Row: {
          id: string;
          student_id: string;
          section_id: string;
          institution_id: string;
          date: string;
          status: "PRESENT" | "ABSENT" | "LATE" | "HALF_DAY" | "EXCUSED";
          remarks: string | null;
          marked_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["student_attendance"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["student_attendance"]["Insert"]>;
      };
      assignments: {
        Row: {
          id: string;
          institution_id: string;
          section_id: string;
          subject_id: string;
          teacher_id: string;
          title: string;
          description: string;
          attachment_url: string | null;
          due_date: string;
          priority: "LOW" | "MEDIUM" | "HIGH";
          status: "DRAFT" | "PUBLISHED" | "CLOSED";
          max_marks: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["assignments"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["assignments"]["Insert"]>;
      };
      student_fees: {
        Row: {
          id: string;
          student_id: string;
          fee_structure_id: string;
          academic_year_id: string;
          total_amount: number;
          discount_amount: number;
          paid_amount: number;
          pending_amount: number;
          due_date: string;
          status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
          remarks: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["student_fees"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["student_fees"]["Insert"]>;
      };
      fee_payments: {
        Row: {
          id: string;
          student_fee_id: string;
          student_id: string;
          receipt_number: string;
          amount: number;
          payment_date: string;
          payment_method: "ONLINE" | "CASH" | "CHEQUE" | "UPI" | "BANK_TRANSFER";
          transaction_ref: string | null;
          notes: string | null;
          collected_by_user_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["fee_payments"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["fee_payments"]["Insert"]>;
      };
      tasks: {
        Row: {
          id: string;
          institution_id: string;
          title: string;
          description: string;
          assignee_user_id: string | null;
          created_by_user_id: string;
          department_id: string | null;
          priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
          due_date: string | null;
          status: "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["tasks"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          institution_id: string;
          user_id: string | null;
          user_name: string | null;
          user_email: string | null;
          action: string;
          entity: string;
          entity_id: string | null;
          details: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {
      is_member_of_institution: {
        Args: { inst_id: string };
        Returns: boolean;
      };
      get_auth_user_role: {
        Args: { inst_id: string };
        Returns: string;
      };
    };
  };
}
