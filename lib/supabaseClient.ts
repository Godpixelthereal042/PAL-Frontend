import { createClient } from "@supabase/supabase-js";

let clientInstance: any = null;

function getSupabaseClient() {
    if (clientInstance) return clientInstance;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url-for-build.supabase.co";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "dummy-key-for-build";

    clientInstance = createClient(supabaseUrl, supabaseAnonKey);
    return clientInstance;
}

export const supabase = new Proxy({} as any, {
    get(target, prop) {
        return Reflect.get(getSupabaseClient(), prop);
    }
});

