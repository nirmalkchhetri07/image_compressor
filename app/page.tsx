'use client'

import { useImageStore } from '@/store/imageStore'
import { useCompression } from '@/hooks/useCompression'
import { DropZone } from '@/components/upload/DropZone'
import { ClipboardPaste } from '@/components/upload/ClipboardPaste'
import { CompressionSettings } from '@/components/compressor/CompressionSettings'
import { FileList } from '@/components/upload/FileList'
import { StatsDashboard } from '@/components/statistics/StatsDashboard'
import { BeforeAfter } from '@/components/preview/BeforeAfter'
import { DownloadPanel } from '@/components/download/DownloadPanel'
import { Code, Moon, Sun, Zap, Smartphone, Lock, Loader2, X, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const files = useImageStore((state) => state.files)
  const clearAll = useImageStore((state) => state.clearAll)
  const processAll = useImageStore((state) => state.processAll)
  const loadSettings = useImageStore((state) => state.loadSettings)
  const undoLastRemove = useImageStore((state) => state.undoLastRemove)
  const removedFilesStack = useImageStore((state) => state.removedFilesStack)
  const downloadAll = useImageStore((state) => state.downloadAll)

  const { isCompressing } = useCompression()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  // Toast Notifications State
  interface Toast {
    id: string
    message: string
    type: 'success' | 'info' | 'warning'
  }
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Math.random().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  // Load theme and settings on mount
  useEffect(() => {
    setMounted(true)
    loadSettings()

    const isDarkMode = localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(isDarkMode)
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [loadSettings])

  // Keyboard Shortcuts Listener (Ctrl+Z and Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z / Cmd+Z to undo file deletion
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        if (removedFilesStack.length > 0) {
          undoLastRemove()
          showToast('Restored last removed image', 'success')
        } else {
          showToast('No deleted images to undo', 'info')
        }
      }

      // Ctrl+S / Cmd+S to batch save ZIP
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        const completedFiles = files.filter((f) => f.status === 'done')
        if (completedFiles.length > 0) {
          downloadAll()
          showToast('Generating and downloading ZIP package...', 'success')
        } else {
          showToast('No successfully compressed images to save yet', 'warning')
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [removedFilesStack, files, downloadAll, undoLastRemove])

  // Auto-select first file on new upload
  useEffect(() => {
    if (files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id)
    } else if (files.length === 0 && selectedFileId) {
      setSelectedFileId(null)
    }
  }, [files, selectedFileId])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    if (newIsDark) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const pendingFiles = files.filter((f) => f.status === 'idle')
  const selectedFile = files.find((f) => f.id === selectedFileId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                ImageOptimizer Pro
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Local Browser Optimization</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 hover:bg-slate-850 rounded-xl transition-all duration-250 text-slate-400 hover:text-blue-400"
              aria-label="GitHub Repository"
            >
              <Code className="w-5 h-5" />
            </a>
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-slate-850 rounded-xl transition-all duration-250 text-slate-400 hover:text-blue-400"
              aria-label="Toggle light/dark theme"
            >
              {mounted && (isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />)}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Full-width Hero / Welcome Upload section if empty queue */}
        {files.length === 0 && (
          <section className="max-w-4xl mx-auto py-12 text-center">
            <div className="mb-10">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Optimize & Compress Images
                <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mt-1">
                  100% Client-Side & Secure
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Experience desktop-grade image compression right in your browser. All computations happen locally — your files never touch a server.
              </p>

              {/* Feature cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 mb-8">
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-blue-500/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-500/15 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Zero-Lag Speeds</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Multi-threaded browser background workers compress large images in milliseconds.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-cyan-500/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-cyan-500/15 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Lock className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Complete Privacy</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Process files completely offline. Safe, HIPAA-aligned, and secure.</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/40 transition-all duration-300">
                  <div className="w-12 h-12 bg-purple-500/15 rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Smartphone className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">Exact Size Control</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">Set target thresholds in KB/MB to auto-adjust dimensions and binary-search quality.</p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            <div className="bg-slate-900/60 rounded-3xl border border-slate-700/50 p-8 shadow-2xl backdrop-blur-xl">
              <DropZone compact={false} />
              <div className="mt-6 pt-6 border-t border-slate-800/80">
                <ClipboardPaste />
              </div>
            </div>
          </section>
        )}

        {/* Two-Column Workspace Layout when images are in queue */}
        {files.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (Upload compact + Settings Panel + General actions) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1 custom-scrollbar select-none">
              {/* Compact drop area to add more images */}
              <div className="p-5 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-xl">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
                  Upload More Files
                </h3>
                <DropZone compact={true} />
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <ClipboardPaste />
                </div>
              </div>

              {/* Compression settings panel */}
              <CompressionSettings 
                selectedFileId={selectedFileId} 
                setSelectedFileId={setSelectedFileId} 
                showToast={showToast} 
              />

              {/* Global queue actions */}
              <div className="flex gap-3 bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
                <button
                  onClick={() => {
                    showToast('Starting queue optimization...', 'info')
                    processAll()
                  }}
                  disabled={isCompressing || pendingFiles.length === 0}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl disabled:opacity-45 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  {isCompressing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Compressing Queue...
                    </>
                  ) : (
                    `Optimize Queue (${pendingFiles.length})`
                  )}
                </button>
                <button
                  onClick={() => {
                    clearAll()
                    setSelectedFileId(null)
                    showToast('Cleared image queue', 'info')
                  }}
                  disabled={isCompressing}
                  className="px-4 py-2.5 bg-slate-800/80 hover:bg-slate-750/80 text-slate-300 hover:text-white font-bold rounded-xl border border-slate-700 disabled:opacity-45 transition-colors duration-200"
                >
                  Clear Queue
                </button>
              </div>
            </div>

            {/* Right Column (Statistics dashboard, File queue list, Preview Slider, Batch downloads history) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stats dashboard */}
              <StatsDashboard />

              {/* Sortable File Queue list */}
              <FileList 
                files={files} 
                selectedFileId={selectedFileId} 
                setSelectedFileId={setSelectedFileId} 
                showToast={showToast} 
              />

              {/* Live Preview Comparison Slider */}
              {selectedFileId && selectedFile && (
                <div className="p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="font-bold text-white text-lg">Optimizer Comparison</h3>
                      <p className="text-xs text-slate-400 truncate max-w-[280px] sm:max-w-md">
                        Reviewing: {selectedFile.originalFile.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFileId(null)}
                      className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Close preview"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <BeforeAfter file={selectedFile} />
                </div>
              )}

              {/* Batch downloads and history panel */}
              <DownloadPanel showToast={showToast} />
            </div>
          </div>
        )}
      </main>

      {/* Footer (only visible when queue is empty) */}
      {!files.length && mounted && (
        <footer className="mt-20 py-12 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-xs">
            <p>
              Built with Next.js, React, Zustand, and Tailwind CSS. Processing runs fully sandboxed within your local browser runtime.
            </p>
          </div>
        </footer>
      )}

      {/* Undo Delete overlay shortcut helper */}
      {removedFilesStack.length > 0 && (
        <div className="fixed bottom-6 left-6 z-50 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => {
              undoLastRemove()
              showToast('Restored last removed file', 'success')
            }}
            className="px-4 py-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            Undo file delete (Ctrl+Z)
          </button>
        </div>
      )}

      {/* Toast notifications rendering */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 pointer-events-auto animate-in slide-in-from-bottom duration-300 font-semibold text-xs text-white ${
              toast.type === 'success'
                ? 'bg-emerald-600 border-emerald-500 shadow-emerald-950/20'
                : toast.type === 'warning'
                ? 'bg-amber-600 border-amber-500 shadow-amber-950/20'
                : 'bg-slate-800 border-slate-700 shadow-slate-950/20'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
