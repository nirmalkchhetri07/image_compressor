'use client'

import { ImageFile } from '@/types'
import { useImageStore } from '@/store/imageStore'
import { formatBytes, formatPercentage } from '@/utils/formatBytes'
import { Trash2, Loader2, Check, AlertCircle, RefreshCw, Eye, Sliders, ArrowUpDown, GripVertical } from 'lucide-react'
import { useState, useMemo, DragEvent } from 'react'

interface FileListProps {
  files: ImageFile[]
  selectedFileId: string | null
  setSelectedFileId: (id: string | null) => void
  showToast?: (message: string, type: 'success' | 'info' | 'warning') => void
}

export function FileList({ files, selectedFileId, setSelectedFileId, showToast }: FileListProps) {
  const removeFile = useImageStore((state) => state.removeFile)
  const reorderFiles = useImageStore((state) => state.reorderFiles)
  const processFile = useImageStore((state) => state.processFile)

  const [sortBy, setSortBy] = useState<'name' | 'size' | 'ratio' | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Toggle sorting
  const handleSort = (type: 'name' | 'size' | 'ratio') => {
    if (sortBy === type) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(type)
      setSortDir('desc') // Default to descending (e.g. largest size / ratio first)
    }
  }

  // Sort files array based on criteria
  const sortedFiles = useMemo(() => {
    const arr = [...files]
    if (!sortBy) return arr

    return arr.sort((a, b) => {
      let valA: any = 0
      let valB: any = 0

      if (sortBy === 'name') {
        valA = a.originalFile.name.toLowerCase()
        valB = b.originalFile.name.toLowerCase()
      } else if (sortBy === 'size') {
        valA = a.originalSize
        valB = b.originalSize
      } else if (sortBy === 'ratio') {
        const sizeA = a.compressedSize || a.originalSize
        const sizeB = b.compressedSize || b.originalSize
        valA = (a.originalSize - sizeA) / a.originalSize
        valB = (b.originalSize - sizeB) / b.originalSize
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1
      if (valA > valB) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [files, sortBy, sortDir])

  // Drag and Drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    // For Firefox compatibility
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderFiles(draggedIndex, targetIndex)
      if (showToast) showToast('Reordered list', 'info')
    }
    setDraggedIndex(null)
  }

  const handleRecompress = async (e: React.MouseEvent, file: ImageFile) => {
    e.stopPropagation()
    if (file.status === 'processing') return
    
    if (showToast) showToast(`Re-compressing ${file.originalFile.name}...`, 'info')
    await processFile(file.id)
    if (showToast) showToast(`Compression finished for ${file.originalFile.name}!`, 'success')
  }

  const handleRemove = (e: React.MouseEvent, file: ImageFile) => {
    e.stopPropagation()
    removeFile(file.id)
    if (selectedFileId === file.id) {
      setSelectedFileId(null)
    }
    if (showToast) showToast(`Removed ${file.originalFile.name}. Press Ctrl+Z to undo.`, 'info')
  }

  if (files.length === 0) return null

  return (
    <div className="space-y-4 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-xl">
      {/* File List Header and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-white text-lg">Images Queue ({files.length})</h3>
          <p className="text-xs text-slate-400">Click a card to edit its overrides & view preview</p>
        </div>

        {/* Sorting controls */}
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-semibold self-center mr-1">Sort:</span>
          <button
            onClick={() => handleSort('name')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              sortBy === 'name'
                ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                : 'border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            Name
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSort('size')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              sortBy === 'size'
                ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                : 'border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            Size
            <ArrowUpDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleSort('ratio')}
            className={`px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
              sortBy === 'ratio'
                ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                : 'border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            Ratio
            <ArrowUpDown className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Drag & Drop Queue List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {sortedFiles.map((file, idx) => {
          const isSelected = selectedFileId === file.id
          const hasOverride = !!file.settings
          const savingsPercent = file.compressedSize 
            ? ((file.originalSize - file.compressedSize) / file.originalSize) * 100 
            : 0

          return (
            <div
              key={file.id}
              draggable={!sortBy} // Drag and drop disabled when sorted to avoid coordinate confusion
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onClick={() => setSelectedFileId(file.id)}
              className={`group flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5'
                  : 'border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/30'
              }`}
            >
              {/* Drag Handle (Hidden when sorting is active) */}
              {!sortBy && (
                <div 
                  className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-1"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
              )}

              {/* Image Preview Thumbnail */}
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex-shrink-0">
                <img
                  src={file.originalPreviewUrl}
                  alt={file.originalFile.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-white text-sm truncate">{file.originalFile.name}</h4>
                  
                  {/* Overrides Badge */}
                  {hasOverride && (
                    <span 
                      className="px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-bold rounded-md flex items-center gap-0.5"
                      title="Custom overrides applied"
                    >
                      <Sliders className="w-2.5 h-2.5" />
                      Override
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-slate-400 text-xs mt-1">
                  <span>{file.originalDimensions.width}×{file.originalDimensions.height}</span>
                  <span>•</span>
                  <span>{formatBytes(file.originalSize)}</span>
                  
                  {file.status === 'done' && file.compressedSize && (
                    <>
                      <span>→</span>
                      <span className="text-blue-400 font-bold">{formatBytes(file.compressedSize)}</span>
                      {savingsPercent > 0 && (
                        <span className="text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-1.5 py-0.2 rounded">
                          ↓{formatPercentage(savingsPercent)}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Right Side status & Actions */}
              <div className="flex items-center gap-3">
                {/* Status Badges */}
                {file.status === 'processing' && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Optimizing
                  </div>
                )}
                {file.status === 'done' && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[10px] font-bold">
                    <Check className="w-3 h-3" />
                    Compressed
                  </div>
                )}
                {file.status === 'error' && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-[10px] font-bold" title={file.error}>
                    <AlertCircle className="w-3 h-3" />
                    Failed
                  </div>
                )}

                {/* Quick actions panel */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFileId(file.id)
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSelected ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                    title="Preview Image"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleRecompress(e, file)}
                    disabled={file.status === 'processing'}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg disabled:opacity-40 transition-colors"
                    title="Re-compress"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleRemove(e, file)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
