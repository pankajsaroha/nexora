-- ==============================================================================
-- NEXORA DATABASE MIGRATION 007: ROW LEVEL SECURITY & TENANT ISOLATION
-- ==============================================================================

-- 1. Helper Functions (Security Definer)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_member_of_institution(inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_user_id = auth.uid() 
          AND institution_id = inst_id 
          AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_auth_user_role(inst_id UUID)
RETURNS TEXT AS $$
    SELECT role_code FROM public.profiles 
    WHERE auth_user_id = auth.uid() 
      AND institution_id = inst_id 
      AND is_active = true
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_principal(inst_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE auth_user_id = auth.uid() 
          AND institution_id = inst_id 
          AND role_code IN ('SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL')
          AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_guardian_of_student(stud_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.student_guardians sg
        JOIN public.guardians g ON g.id = sg.guardian_id
        JOIN public.profiles p ON p.id = g.user_id
        WHERE sg.student_id = stud_id
          AND p.auth_user_id = auth.uid()
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. Enable RLS on ALL tenant-owned tables
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;

-- 3. Tenant Isolation RLS Policies

-- Institutions Policy
CREATE POLICY "Institutions visible to members or public demo"
ON public.institutions FOR SELECT
USING (
    is_demo = true OR is_member_of_institution(id)
);

CREATE POLICY "Institutions updatable only by admins"
ON public.institutions FOR UPDATE
USING (is_admin_or_principal(id));

-- Profiles Policy
CREATE POLICY "Profiles visible within same institution"
ON public.profiles FOR SELECT
USING (
    auth.uid() = auth_user_id OR is_member_of_institution(institution_id)
);

CREATE POLICY "Profiles updatable by self or admin"
ON public.profiles FOR UPDATE
USING (
    auth.uid() = auth_user_id OR is_admin_or_principal(institution_id)
);

-- Students Policy
CREATE POLICY "Students visible to institution members"
ON public.students FOR SELECT
USING (is_member_of_institution(institution_id));

CREATE POLICY "Students insertable/updatable by authorized staff"
ON public.students FOR ALL
USING (
    is_admin_or_principal(institution_id) OR get_auth_user_role(institution_id) = 'STAFF'
);

-- Student Attendance Policy
CREATE POLICY "Attendance visible to institution members or parent of student"
ON public.student_attendance FOR SELECT
USING (
    is_member_of_institution(institution_id) OR is_guardian_of_student(student_id)
);

CREATE POLICY "Attendance editable by teachers and admins"
ON public.student_attendance FOR ALL
USING (
    is_admin_or_principal(institution_id) OR get_auth_user_role(institution_id) = 'TEACHER'
);

-- Assignments Policy
CREATE POLICY "Assignments visible within institution"
ON public.assignments FOR SELECT
USING (is_member_of_institution(institution_id));

CREATE POLICY "Assignments created by teachers or admins"
ON public.assignments FOR ALL
USING (
    is_admin_or_principal(institution_id) OR get_auth_user_role(institution_id) = 'TEACHER'
);

-- Student Fees & Finance Policy
CREATE POLICY "Fees visible to admin, accountant, student owner or parent"
ON public.student_fees FOR SELECT
USING (
    is_admin_or_principal(
        (SELECT institution_id FROM public.students WHERE id = student_id)
    )
    OR get_auth_user_role((SELECT institution_id FROM public.students WHERE id = student_id)) = 'ACCOUNTANT'
    OR is_guardian_of_student(student_id)
    OR (SELECT user_id FROM public.students WHERE id = student_id) = current_profile_id()
);

CREATE POLICY "Fees manageable by admins and accountants"
ON public.student_fees FOR ALL
USING (
    is_admin_or_principal(
        (SELECT institution_id FROM public.students WHERE id = student_id)
    )
    OR get_auth_user_role((SELECT institution_id FROM public.students WHERE id = student_id)) = 'ACCOUNTANT'
);

-- Tasks Policy
CREATE POLICY "Tasks visible within institution"
ON public.tasks FOR SELECT
USING (is_member_of_institution(institution_id));

CREATE POLICY "Tasks editable by assignee, creator, or admin"
ON public.tasks FOR ALL
USING (
    is_admin_or_principal(institution_id)
    OR assignee_user_id = current_profile_id()
    OR created_by_user_id = current_profile_id()
);

-- Audit Logs Policy
CREATE POLICY "Audit logs visible strictly to institution admins"
ON public.audit_logs FOR SELECT
USING (is_admin_or_principal(institution_id));

CREATE POLICY "Audit logs insertable by system/authenticated user"
ON public.audit_logs FOR INSERT
WITH CHECK (is_member_of_institution(institution_id));
