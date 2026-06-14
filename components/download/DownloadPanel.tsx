'use client'

import { useImageStore } from '@/store/imageStore'
import { formatBytes } from '@/utils/formatBytes'
import { Download, Copy, History, DownloadCloud, FileJson, Check, CopyIcon, Trash2 } from 'lucide-react'
import { useState, useRef } from 'react'

interface DownloadPanelProps {
  showToast?: (message: string, type: 'success' | 'info' | 'warning') => void
}

export function DownloadPanel({ showToast }: DownloadPanelProps) {
  const files = useImageStore((state) => state.files)
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)
  const downloadFile = useImageStore((state) => state.downloadFile)
  const downloadAll = useImageStore((state) => state.downloadAll)
  const downloadHistory = useImageStore((state) => state.downloadHistory)
  const clearHistory = useImageStore((state) => state.clearHistory)

  const [renamePattern, setRenamePattern] = useState('{name}-optimized')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const completedFiles = files.filter((f) => f.status === 'done' && f.compressedBlob)
  const isCompressing = useImageStore((state) => state.isProcessing)

  // Copy URL Helper
  const handleCopyLink = (id: string, blob: Blob) => {
    try {
      const blobUrl = URL.createObjectURL(blob)
      navigator.clipboard.writeText(blobUrl)
      setCopiedId(id)
      if (showToast) showToast('Blob URL copied to clipboard!', 'success')
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      if (showToast) showToast('Failed to copy link', 'warning')
    }
  }

  // Export settings as JSON
  const handleExportSettings = () => {
    try {
      const dataStr = JSON.stringify(globalSettings, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'image-optimizer-settings.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      if (showToast) showToast('Settings exported as JSON!', 'success')
    } catch (err) {
      if (showToast) showToast('Failed to export settings', 'warning')
    }
  }

  // Import settings from JSON
  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string)
        if (parsed && typeof parsed === 'object') {
          // Check for some keys to validate
          const validKeys: (keyof typeof globalSettings)[] = ['targetSize', 'targetUnit', 'mode', 'outputFormat']
          const hasValidKeys = validKeys.some((k) => k in parsed)
          
          if (hasValidKeys) {
            setGlobalSettings(parsed)
            if (showToast) showToast('Settings successfully imported!', 'success')
          } else {
            if (showToast) showToast('Invalid JSON file format', 'warning')
          }
        }
      } catch (err) {
        if (showToast) showToast('Failed to parse JSON file', 'warning')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // Reset input
  }

  const insertToken = (token: string) => {
    setRenamePattern((prev) => prev + token)
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-6 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-lg font-sans">Downloads & Configurations</h3>
          <p className="text-xs text-slate-400">Manage names, formats, exports, and history</p>
        </div>
        
        {/* Settings Import/Export & History Toggles */}
        <div className="flex gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportSettings}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Import Settings JSON"
          >
            <FileJson className="w-4 h-4" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            onClick={handleExportSettings}
            className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Export Settings JSON"
          >
            <DownloadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className={`p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ${
              isHistoryOpen
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Recent Downloads History"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History ({downloadHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Batch ZIP Rename Settings & Download */}
      {completedFiles.length > 0 && (
        <div className="space-y-4">
          <div className="bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                Batch Rename Template
              </label>
              <input
                type="text"
                value={renamePattern}
                onChange={(e) => setRenamePattern(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:outline-none rounded-xl text-xs text-white"
                placeholder="e.g. {name}-optimized"
              />
            </div>
            
            {/* Tokens Helper */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Insert:</span>
              <button
                onClick={() => insertToken('{name}')}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] rounded font-mono"
                title="Original filename"
              >
                {'{name}'}
              </button>
              <button
                onClick={() => insertToken('{date}')}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] rounded font-mono"
                title="Current date (YYYY-MM-DD)"
              >
                {'{date}'}
              </button>
              <button
                onClick={() => insertToken('{width}')}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] rounded font-mono"
                title="Image width"
              >
                {'{width}'}
              </button>
              <button
                onClick={() => insertToken('{height}')}
                className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-[10px] rounded font-mono"
                title="Image height"
              >
                {'{height}'}
              </button>
            </div>
          </div>

          {/* Action Buttons: Batch ZIP and Link Copies */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                if (showToast) showToast('Generating ZIP archive...', 'info')
                downloadAll(renamePattern)
                if (showToast) showToast('ZIP Archive Downloaded!', 'success')
              }}
              disabled={isCompressing || completedFiles.length === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download ZIP ({completedFiles.length} files)
            </button>
          </div>

          {/* Individual Links copying list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Copy Compressed File Links
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {completedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950/30 border border-slate-800/80 rounded-xl"
                >
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[250px]">
                    {file.originalFile.name}
                  </span>
                  
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopyLink(file.id, file.compressedBlob!)}
                      className="p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                    >
                      {copiedId === file.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedId === file.id ? 'Copied' : 'Copy URL'}
                    </button>
                    <button
                      onClick={() => {
                        const nameWithoutExt = file.originalFile.name.replace(/\.[^/.]+$/, '')
                        const ext = file.settings?.outputFormat || globalSettings.outputFormat
                        const dateStr = new Date().toISOString().split('T')[0]
                        const w = file.compressedDimensions?.width || file.originalDimensions.width
                        const h = file.compressedDimensions?.height || file.originalDimensions.height
                        
                        const customName = renamePattern
                          .replace(/{name}/g, nameWithoutExt)
                          .replace(/{date}/g, dateStr)
                          .replace(/{width}/g, String(w))
                          .replace(/{height}/g, String(h))
                        
                        downloadFile(file.id, customName)
                      }}
                      className="p-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Drawer Panel */}
      {isHistoryOpen && (
        <div className="bg-slate-950/60 p-4 border border-slate-800 rounded-xl space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Download History
            </span>
            {downloadHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>

          {downloadHistory.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No recent downloads found.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {downloadHistory.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-center justify-between p-2 bg-slate-950/20 border border-slate-900 rounded-lg text-xs"
                >
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="font-semibold text-slate-300 truncate" title={item.filename}>
                      {item.filename}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {formatBytes(item.compressedSize)} • {new Date(item.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-400 text-[10px] font-mono rounded">
                    {item.format.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
