import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    // Check if URL is present and not a dummy placeholder
    const useSupabase = supabaseUrl && supabaseAnonKey && 
                        !supabaseUrl.includes("dummy-url") && 
                        !supabaseAnonKey.includes("dummy-key");

    if (!useSupabase) {
        return null;
    }

    return createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    );
                } catch {
                    // Ignored if called from a Server Component (where cookies cannot be set)
                }
            },
        },
    });
}
