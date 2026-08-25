import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase Environment Keys inside .env.local!")
}

// Build our connection with an explicit network configuration wrapper
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Remembers users smoothly in the browser
    autoRefreshToken: true,
  },
  global: {
    // Forces the network fetch layer to append headers cleanly over local networks
    headers: { "X-Client-Info": "signpost-indie-tracker" },
  },
})
