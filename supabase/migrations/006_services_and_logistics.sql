-- ==============================================================================
-- NEXORA DATABASE MIGRATION 006: LIBRARY, TRANSPORT & HOSTEL LOGISTICS
-- ==============================================================================

-- 1. Library Books Table
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    isbn TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    publisher TEXT,
    total_copies INT NOT NULL DEFAULT 5,
    available_copies INT NOT NULL DEFAULT 5,
    rack_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Book Issues Table
CREATE TABLE IF NOT EXISTS public.book_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'RETURNED', 'OVERDUE')),
    fine_amount NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    is_fine_paid BOOLEAN NOT NULL DEFAULT false
);

-- 3. Transport Vehicles Table
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    vehicle_number TEXT UNIQUE NOT NULL,
    vehicle_type TEXT NOT NULL DEFAULT 'BUS',
    capacity INT NOT NULL DEFAULT 40,
    driver_name TEXT NOT NULL,
    driver_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'MAINTENANCE'))
);

-- 4. Routes & Stops Table
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    route_name TEXT NOT NULL,
    start_point TEXT NOT NULL,
    end_point TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    stop_name TEXT NOT NULL,
    stop_order INT NOT NULL,
    pickup_time TEXT NOT NULL,
    drop_time TEXT NOT NULL,
    fee_amount NUMERIC(10, 2) NOT NULL DEFAULT 2500.00
);

-- 5. Hostel Residential Table
CREATE TABLE IF NOT EXISTS public.hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'BOYS' CHECK (type IN ('BOYS', 'GIRLS', 'CO_ED')),
    warden_name TEXT NOT NULL,
    warden_phone TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.hostel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL REFERENCES public.hostels(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    floor INT NOT NULL DEFAULT 1,
    total_beds INT NOT NULL DEFAULT 4,
    occupied_beds INT NOT NULL DEFAULT 0,
    fee_per_term NUMERIC(10, 2) NOT NULL DEFAULT 35000.00
);
