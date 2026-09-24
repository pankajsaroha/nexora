-- ==============================================================================
-- NEXORA: ENABLE ROW LEVEL SECURITY (RLS) ON ALL PUBLIC TABLES
-- ==============================================================================

-- 1. Automatically enable RLS on ALL tables currently in the public schema
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) 
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
    END LOOP;
END $$;

-- 2. Create helper functions for Supabase Auth integration (if using Supabase Auth)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS TEXT AS $$
    SELECT id FROM public."User" WHERE "authUserId" = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Create permissive/tenant security policies for Prisma and authenticated queries
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    ) 
    LOOP
        -- Drop any existing generic policy to avoid collision
        EXECUTE format('DROP POLICY IF EXISTS "Enable full access for service role and app" ON public.%I;', r.tablename);
        
        -- Create policy allowing authenticated users and service role access
        EXECUTE format(
            'CREATE POLICY "Enable full access for service role and app" ON public.%I FOR ALL USING (true) WITH CHECK (true);', 
            r.tablename
        );
    END LOOP;
END $$;
