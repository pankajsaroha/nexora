# NEXORA — Supabase Setup & Migration Guide

Follow this guide to connect NEXORA to a live Supabase PostgreSQL database.

---

## 1. Environment Configuration

Add the following variables to your `.env` or `.env.local`:

```env
# Supabase Project Connection
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-public-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# PostgreSQL Direct / Pooler Connection String
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Application Secrets
AUTH_SECRET="your-32-char-random-jwt-secret"
NODE_ENV="development"
```

---

## 2. Running Database Migrations

You can apply the migrations using the Supabase CLI or SQL Editor in the Supabase Dashboard:

```bash
# 1. Apply schema extensions
supabase db execute --file supabase/migrations/001_extensions.sql

# 2. Apply core tables
supabase db execute --file supabase/migrations/002_institutions_and_identity.sql
supabase db execute --file supabase/migrations/003_people_and_academics.sql
supabase db execute --file supabase/migrations/004_attendance_and_workflows.sql
supabase db execute --file supabase/migrations/005_finance_and_operations.sql
supabase db execute --file supabase/migrations/006_services_and_logistics.sql

# 3. Enable RLS and Tenant Isolation Policies
supabase db execute --file supabase/migrations/007_rls_functions_and_policies.sql

# 4. Seed development institutions
supabase db execute --file supabase/migrations/008_seed_data.sql
```

---

## 3. Prisma Schema Synchronization

To generate the typed Prisma client:
```bash
npm run prisma:generate
```
