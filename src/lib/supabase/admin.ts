import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

if (typeof window !== "undefined") {
  throw new Error("Supabase Admin client can only be used on the server.");
}

export function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mock-project.supabase.co";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "mock-service-role-key";

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
