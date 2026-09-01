import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "./env";

export function createSupabaseBrowserClient() {
  const { url, publicKey } = getSupabaseBrowserConfig();

  if (!url || !publicKey) {
    throw new Error("Missing public Supabase environment variables.");
  }

  return createBrowserClient(url, publicKey);
}
