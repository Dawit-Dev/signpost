import React from "react"

// This acts as a contract defining what data this card must receive
interface MonitorCardProps {
  name: string
  url: string
  isUp: boolean
  responseTime: number
  uptimePercentage: number
}

export default function MonitorCard({
  name,
  url,
  isUp,
  responseTime,
  uptimePercentage,
}: MonitorCardProps) {
  return (
    <div className='bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow duration-200'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        {/* Left Hand Details (Status Light and Text) */}
        <div className='flex items-start gap-3.5'>
          <div className='mt-1.5 relative flex h-3 w-3'>
            {isUp ? (
              <>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-emerald-500'></span>
              </>
            ) : (
              <>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-3 w-3 bg-rose-500'></span>
              </>
            )}
          </div>

          <div>
            <h3 className='font-semibold text-slate-900 text-base leading-tight'>
              {name}
            </h3>
            <a
              href={url}
              target='_blank'
              rel='noreferrer'
              className='text-xs text-slate-500 hover:text-indigo-600 transition-colors break-all'
            >
              {url}
            </a>
          </div>
        </div>

        {/* Right Hand Performance Statistics */}
        <div className='flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t border-slate-100 sm:border-0'>
          <div className='text-left sm:text-right'>
            <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
              Speed
            </p>
            <p className='text-sm font-semibold text-slate-700'>
              {responseTime}ms
            </p>
          </div>

          <div className='text-right'>
            <p className='text-[10px] uppercase font-bold text-slate-400 tracking-wider'>
              Uptime
            </p>
            <p
              className={`text-sm font-bold ${
                isUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {uptimePercentage}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
