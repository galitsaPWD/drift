import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn("[Supabase] Required environment variables are missing. Check your .env.local or Vercel settings.");
    // Return a dummy client that won't throw on top-level initialization
    return createBrowserClient(
      supabaseUrl || "MISSING_URL",
      supabaseKey || "MISSING_KEY"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
