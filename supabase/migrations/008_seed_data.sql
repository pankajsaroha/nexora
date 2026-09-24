-- ==============================================================================
-- NEXORA DATABASE MIGRATION 008: SEED DATA (NORTHSTAR ACADEMY & RIVERSIDE COLLEGE)
-- ==============================================================================

-- 1. Create Core Permissions & Roles
INSERT INTO public.roles (code, name, description, is_system) VALUES
('SUPER_ADMIN', 'Platform Administrator', 'Full cross-tenant infrastructure access', true),
('INSTITUTION_ADMIN', 'Institution Administrator', 'Complete tenant-level configuration and user access control', true),
('PRINCIPAL', 'Principal / Head of Institution', 'Executive overview of attendance, finance, academics and staff', true),
('TEACHER', 'Faculty Member', 'Classroom roll-call, timetable, assignments and grades', true),
('STUDENT', 'Enrolled Scholar', 'Own timetable, attendance, coursework submissions and report card', true),
('PARENT', 'Parent / Guardian', 'Linked children academic ledger, fee payments and attendance', true),
('ACCOUNTANT', 'Bursar & Accountant', 'Fee collections, receipts ledger, payroll and balance sheets', true),
('HOD', 'Head of Department', 'Department curriculum, faculty allocations and reports', true),
('STAFF', 'Administrative Staff', 'Admissions, transport, library and campus facilities', true)
ON CONFLICT (code) DO NOTHING;

-- 2. Seed Institution A: Northstar International Academy
INSERT INTO public.institutions (
    id, name, code, slug, type, address, city, state, pincode, country, phone, email, website, timezone, currency, currency_symbol, status, is_demo
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'Northstar International Academy',
    'NORTHSTAR-2026',
    'northstar-academy',
    'SCHOOL',
    'Plot 12, Knowledge Park III, Expressway Sector',
    'Greater Noida',
    'Uttar Pradesh',
    '201306',
    'India',
    '+91 98100 11000',
    'admissions@northstar.edu.in',
    'https://northstar.edu.in',
    'Asia/Kolkata',
    'INR',
    '₹',
    'ACTIVE',
    false
) ON CONFLICT (code) DO NOTHING;

-- 3. Seed Institution B: Riverside College (for Tenant Isolation Verification)
INSERT INTO public.institutions (
    id, name, code, slug, type, address, city, state, pincode, country, phone, email, website, timezone, currency, currency_symbol, status, is_demo
) VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'Riverside College of Arts & Science',
    'RIVERSIDE-2026',
    'riverside-college',
    'COLLEGE',
    '45 University Avenue, Cyber City',
    'Bengaluru',
    'Karnataka',
    '560001',
    'India',
    '+91 98100 22000',
    'admin@riverside.edu.in',
    'https://riverside.edu.in',
    'Asia/Kolkata',
    'INR',
    '₹',
    'ACTIVE',
    false
) ON CONFLICT (code) DO NOTHING;
