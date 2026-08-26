"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Auth } from "@supabase/auth-ui-react"
import { ThemeSupa } from "@supabase/auth-ui-shared"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // Prevents server-side parsing bugs and ensures smooth browser rendering
  useEffect(() => {
    setMounted(true)

    // Automated Security Sweep: If a user is ALREADY logged in, send them straight to the dashboard!
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        router.push("/")
      }
    }
    checkUser()

    // Listen live for when a user signs in successfully
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push("/")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (!mounted) return null

  return (
    <div className='min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-900'>
      {/* BRANDING HEADER AREA */}
      <div className='sm:mx-auto sm:w-full sm:max-w-md text-center'>
        <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 font-black text-2xl text-white shadow-md'>
          S
        </div>
        <h2 className='mt-6 text-3xl font-extrabold tracking-tight text-slate-900'>
          Sign in to your platform
        </h2>
        <p className='mt-2 text-sm text-slate-500'>
          Securely manage your global website uptime monitors.
        </p>
      </div>

      {/* CORE LOGIN WIDGET BOX */}
      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-slate-200'>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#4f46e5", // Matches our beautiful Indigo-600 theme color!
                    brandAccent: "#4338ca",
                    inputBackground: "#f8fafc",
                    inputText: "#0f172a",
                    inputBorder: "#cbd5e1",
                    inputPlaceholder: "#94a3b8",
                  },
                  radii: {
                    borderRadiusButton: "12px", // Clean, modern rounded curves matching our cards
                  },
                },
              },
            }}
            providers={[]} // Keeps it clean with standard Email/Password accounts for now!
            redirectTo={`${typeof window !== "undefined" ? window.location.origin : ""}/`}
          />
        </div>
      </div>
    </div>
  )
}
