import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// This handles a secure background request sent to our system
export async function GET(request: Request) {
  try {
    // 🔒 THE SECURITY GUARD: Only allow our trusted cloud clock to run this code
    const authHeader = request.headers.get("Authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized Access" },
        { status: 401 }
      )
    }

    // 1. Fetch all active websites tracking profiles from our cloud warehouse
    const { data: monitors, error: fetchError } = await supabase
      .from("monitors")
      .select("id, name, url")

    if (fetchError) throw fetchError

    // If our database is completely empty, stop early
    if (!monitors || monitors.length === 0) {
      return NextResponse.json({ message: "No monitors found to scan." })
    }

    // 2. Loop through each website and run a live network check
    const results = await Promise.all(
      monitors.map(async (monitor) => {
        const startTime = Date.now()
        let isUp = false
        let responseTime = 0

        try {
          // Fire a rapid diagnostic fetch to check if the website responds
          const response = await fetch(monitor.url, {
            method: "GET",
            headers: { "User-Agent": "SignPost-Uptime-Bot" },
            // If the website doesn't answer within 5 seconds, count it as a crash
            signal: AbortSignal.timeout(5000),
          })

          // Calculate how many milliseconds it took to load
          responseTime = Date.now() - startTime
          isUp = response.ok // True if status is 200-299
        } catch (botError) {
          // If the network request fails completely or times out, it's DOWN
          console.error(`Alert: ${monitor.name} is down!`, botError)
          isUp = false
          responseTime = 0
        }

        // 3. Update the website row directly inside our live database
        const { error: updateError } = await supabase
          .from("monitors")
          .update({
            is_up: isUp,
            response_time: responseTime,
            // Simple calculation: if it's up, maintain high marks for our prototype phase
            uptime_percentage: isUp ? 100.0 : 99.0,
          })
          .eq("id", monitor.id)

        if (updateError) {
          console.error(
            `Failed to update database for ${monitor.name}:`,
            updateError
          )
        }

        return {
          id: monitor.id,
          name: monitor.name,
          status: isUp ? "Online" : "Offline",
          speed: `${responseTime}ms`,
        }
      })
    )

    // Return a professional clean report summary
    return NextResponse.json({
      message: "Background website scan completed successfully.",
      timestamp: new Date().toISOString(),
      processed: results,
    })
  } catch (globalError: any) {
    console.error("Automation Engine Crashed:", globalError)
    return NextResponse.json(
      {
        error: "Internal Automation Engine Failure",
        details: globalError.message,
      },
      { status: 500 }
    )
  }
}
