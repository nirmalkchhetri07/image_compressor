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
import { Zap, Smartphone, Lock, Loader2, X, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const files = useImageStore((state) => state.files)
  const clearAll = useImageStore((state) => state.clearAll)
  const processAll = useImageStore((state) => state.processAll)
  const loadSettings = useImageStore((state) => state.loadSettings)
  const undoLastRemove = useImageStore((state) => state.undoLastRemove)
  const removedFilesStack = useImageStore((state) => state.removedFilesStack)
  const downloadAll = useImageStore((state) => state.downloadAll)

  const { isCompressing } = useCompression()
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

  // Load settings on mount
  useEffect(() => {
    setMounted(true)
    loadSettings()
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


  const pendingFiles = files.filter((f) => f.status === 'idle')
  const selectedFile = files.find((f) => f.id === selectedFileId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-100 transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className='mt-0.9'>
                <Image src="/logo.svg" alt="Logo Text" width={200} height={24} className="object-contain" />
             
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
              <svg viewBox="0 0 24 24" aria-hidden="true" className="w-5 h-5 fill-current">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
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
             Made with ❤️ and ☕ in NEPAL
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
