import { createClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig, getSupabaseServiceRoleKey } from "./env";

export function createSupabaseAdminClient() {
  const { url } = getSupabaseServerConfig();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) {
    throw new Error("Missing server-only Supabase admin environment variables.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
