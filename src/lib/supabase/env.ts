function firstEnv(...names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return "";
}

export function getSupabaseServerConfig() {
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const publicKey = firstEnv(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY"
  );

  return { url, publicKey };
}

export function getSupabaseBrowserConfig() {
  const url = firstEnv("NEXT_PUBLIC_SUPABASE_URL");
  const publicKey = firstEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return { url, publicKey };
}

export function getSupabaseServiceRoleKey() {
  return firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_SERVICE_ROLE_SECRET"
  );
}
