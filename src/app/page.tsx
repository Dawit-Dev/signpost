// Production Cloud Trigger Build #1
"use client"

// ⚡ FORCE LIVE DYNAMIC RETRIEVAL (Bypasses Vercel's Static Build Cache)
export const dynamic = "force-dynamic"

import React, { useState, useEffect } from "react"
import MonitorCard from "@/components/MonitorCard"
import { supabase } from "@/lib/supabase"

// Define the structure of a Monitor row from our database
interface MonitorRecord {
  id: number
  name: string
  url: string
  is_up: boolean
  response_time: number
  uptime_percentage: number
}

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [siteName, setSiteName] = useState("")
  const [siteUrl, setSiteUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // 1. STATE MEMORY: Stores our real database rows instead of mock data
  const [monitors, setMonitors] = useState<MonitorRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 2. DATABASE FETCHER: Pulls real rows from our cloud table
  const fetchMonitors = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("monitors")
        .select("*")
        .order("created_at", { ascending: false }) // Newest sites appear first

      if (error) throw error
      setMonitors(data || [])
    } catch (error) {
      console.error("Failed to stream data from warehouse:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 3. AUTOMATED LOAD TRIGGER: Runs automatically the split-second the screen wakes up
  useEffect(() => {
    fetchMonitors()
  }, [])

  const handleCreateMonitor = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("monitors")
        .insert([{ name: siteName, url: siteUrl }])

      if (error) throw error

      // 🟢 ADD THIS LINE EXACTLY HERE
      alert("🎉 Business Asset Secured: Saved directly to the cloud database!")

      setSiteName("")
      setSiteUrl("")
      setIsModalOpen(false)

      // 🔄 REFRESH DESK: Immediately pull down the fresh data row without reloading the browser
      fetchMonitors()
    } catch (error) {
      console.error("Database insertion crashed:", error)
      alert("⚠️ Production Connection Gate Blocked.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900'>
      {/* GLOBAL NAVIGATION HEADER */}
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
          <div className='flex items-center gap-4'>
            <button className='flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700'>
              U
            </button>
          </div>
        </div>
      </header>

      {/* MAIN HUB CONTENT WRAPPER */}
      <main className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Top Control Bar Area */}
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

        {/* 🛠️ LIVE STREAMED MONITOR GRID */}
        {isLoading ? (
          <div className='text-center py-12'>
            <p className='text-sm text-slate-500 animate-pulse font-medium'>
              Scanning cloud database warehouse...
            </p>
          </div>
        ) : monitors.length === 0 ? (
          <div className='rounded-xl border border-dashed border-slate-300 p-12 text-center bg-white'>
            <p className='text-sm text-slate-500 font-medium'>
              No websites tracked yet. Click "+ Add New Monitor" above to begin!
            </p>
          </div>
        ) : (
          <div className='grid gap-4 grid-cols-1'>
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                name={monitor.name}
                url={monitor.url}
                isUp={monitor.is_up} // Maps to underscore format from PostgreSQL
                responseTime={monitor.response_time}
                uptimePercentage={Number(monitor.uptime_percentage)}
              />
            ))}
          </div>
        )}
      </main>

      {/* THE POP-UP MODAL WINDOW LAYER */}
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
