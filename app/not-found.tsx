'use client'

import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-slate-900/60 border border-slate-700/50 rounded-3xl shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in duration-300">
        
        {/* Glow/Icon Header */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center bg-blue-500/10 border border-blue-500/30 rounded-2xl shadow-lg shadow-blue-500/10">
          <Compass className="w-12 h-12 text-blue-400 animate-spin" style={{ animationDuration: '10s' }} />
          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-md"></div>
        </div>

        {/* Text Contents */}
        <div className="space-y-3">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you are looking for doesn't exist, has been moved, or resides outside the compression pipeline.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-800/80">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
