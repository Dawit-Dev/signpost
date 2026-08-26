"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import MonitorCard from "@/components/MonitorCard"
import { supabase } from "@/lib/supabase"

export const dynamic = "force-dynamic"

interface MonitorRecord {
  id: number
  name: string
  url: string
  is_up: boolean
  response_time: number
  uptime_percentage: number
}

export default function Dashboard() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [monitors, setMonitors] = useState<MonitorRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  // 1. AUTOMATED SECURITY CHECK & ACCOUNT ENGINE
  useEffect(() => {
    const handleSecureSync = async () => {
      try {
        // Fetch current active logged-in user profile session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // 🔒 IDENTITY GATE: If no account is active, instantly bounce back to login screen!
        if (!session) {
          router.push("/login")
          return
        }

        // Store user email profile to display on header desk
        setUserEmail(session.user.email || "Active User")

        // 🔄 STREAM FILTERED ROWS: Pull data matching this account identity exclusively
        const { data, error } = await supabase
          .from("monitors")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setMonitors(data || [])
      } catch (error) {
        console.error("Security handshake failure:", error)
      } finally {
        setIsLoading(false)
      }
    }

    handleSecureSync()

    // Listen live for if the user logs out so we can kick them off the dashboard cleanly
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push("/login")
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("monitors")
        .insert([{ name: siteName, url: siteUrl }]) // Supabase RLS automatically tags user_id now

      if (error) throw error

      alert("🎉 Business Asset Secured: Saved directly to the cloud database!")
      setSiteName("")
      setSiteUrl("")
      setIsModalOpen(false)

      // Refresh user view
      const { data } = await supabase
        .from("monitors")
        .select("*")
        .order("created_at", { ascending: false })
      setMonitors(data || [])
    } catch (error) {
      console.error("Database insertion crashed:", error)
      alert("⚠️ Production Connection Gate Blocked.")
    } finally {
      setIsSaving(false)
    }
  }

  // 🚪 SIGN OUT ENGINE ACTION
  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center text-slate-900'>
        <p className='text-sm font-medium animate-pulse'>
          Running identity security check...
        </p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      {/* SECURE GLOBAL NAVIGATION HEADER */}
      <header className='sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm'>
              S
            </div>
            <span className='text-lg font-bold tracking-tight text-slate-900'>
              Sign<span className='text-indigo-600'>Post</span>
            </span>
          </div>

          {/* USER CONSOLE ACCOUNT CONTROL BLOCK */}
          <div className='flex items-center gap-4'>
            <span className='text-xs text-slate-500 font-medium hidden sm:inline'>
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className='inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors'
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* MAIN HUB WRAPPER CONTENT */}
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 mb-8'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900'>
              Monitors
            </h1>
            <p className='mt-1 text-sm text-slate-500'>
              Track the live operational health and deployment speeds of your
              websites.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className='inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors'
          >
            + Add New Monitor
          </button>
        </div>

        {monitors.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white'>
            <p className='text-sm text-slate-500 font-medium'>
              {`No websites tracked on this account profile yet. 
              Click "+ Add New Monitor" above to begin!`}
            </p>
          </div>
        ) : (
          <div className='grid gap-4 grid-cols-1'>
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                name={monitor.name}
                url={monitor.url}
                isUp={monitor.is_up}
                responseTime={monitor.response_time}
                uptimePercentage={Number(monitor.uptime_percentage)}
              />
            ))}
          </div>
        )}
      </main>

      {/* NEW MONITOR FORM POPUP CONFIGURATION */}
      {isModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/40 backdrop-blur-sm'
            onClick={() => setIsModalOpen(false)}
          />
          <div className='relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl border border-slate-100 z-10'>
            <h2 className='text-lg font-bold text-slate-900'>
              Add New Monitor
            </h2>
            <p className='mt-1 text-xs text-slate-500'>
              Configure a new background check for your website or service
              endpoint.
            </p>

            <form onSubmit={handleCreateMonitor} className='mt-5 space-y-4'>
              <div>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5'>
                  Monitor Name
                </label>
                <input
                  type='text'
                  required
                  disabled={isSaving}
                  placeholder='e.g., Google Engine'
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none bg-slate-50/50'
                />
              </div>

              <div>
                <label className='block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5'>
                  Target URL
                </label>
                <input
                  type='url'
                  required
                  disabled={isSaving}
                  placeholder='https://google.com'
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  className='w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none bg-slate-50/50'
                />
              </div>

              <div className='flex items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-6'>
                <button
                  type='button'
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className='rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSaving}
                  className='rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:opacity-50'
                >
                  {isSaving ? "Saving..." : "Create Monitor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
