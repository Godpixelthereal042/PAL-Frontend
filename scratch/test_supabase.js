import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url-for-build.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key-for-build";

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key:", supabaseAnonKey ? "Present (length: " + supabaseAnonKey.length + ")" : "Missing");

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
    try {
        const { data, error } = await supabase.from("users").select("count");
        if (error) {
            console.error("Query Error:", error);
        } else {
            console.log("Query Success! Data:", data);
        }
    } catch (err) {
        console.error("Execution Error:", err);
    }
}

test();
