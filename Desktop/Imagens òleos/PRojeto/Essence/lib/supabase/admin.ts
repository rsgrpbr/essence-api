import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase admin client with service role access
 * This client bypasses Row Level Security (RLS) policies
 * Use only in secure server-side contexts
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
  }

  if (!supabaseServiceRole) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
  }

  return createClient(supabaseUrl, supabaseServiceRole, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
