'use client'

import { create } from 'zustand'
import { ImageFile, CompressionSettings, BatchProgress, FileStatus } from '@/types'
import { validateFile } from '@/lib/validation/fileValidator'
import { binarySearchCompress } from '@/lib/compression/engine'

export interface DownloadHistoryItem {
  id: string
  filename: string
  originalSize: number
  compressedSize: number
  format: string
  timestamp: number
}

interface ImageStore {
  files: ImageFile[]
  globalSettings: CompressionSettings
  applyToAll: boolean
  batchProgress: BatchProgress
  isProcessing: boolean
  removedFilesStack: ImageFile[]
  downloadHistory: DownloadHistoryItem[]
  loadSettings: () => void
  addFiles: (files: File[]) => Promise<void>
  removeFile: (id: string) => void
  undoLastRemove: () => void
  reorderFiles: (startIndex: number, endIndex: number) => void
  updateFile: (id: string, updates: Partial<ImageFile>) => void
  setGlobalSettings: (settings: Partial<CompressionSettings>) => void
  setApplyToAll: (value: boolean) => void
  setFileSettings: (id: string, settings: Partial<CompressionSettings>) => void
  processFile: (id: string) => Promise<void>
  processAll: () => Promise<void>
  downloadFile: (id: string, customName?: string) => void
  downloadAll: (renamePattern?: string) => Promise<void>
  clearAll: () => void
  clearCompleted: () => void
  addToHistory: (item: Omit<DownloadHistoryItem, 'timestamp'>) => void
  clearHistory: () => void
}

const DEFAULT_SETTINGS: CompressionSettings = {
  targetSize: 200,
  targetUnit: 'KB',
  mode: 'quality',
  outputFormat: 'webp',
  resizeMode: 'original',
  maintainAspectRatio: true,
  preserveTransparency: true,
  backgroundFill: '#ffffff',
  quality: 80,
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const useImageStore = create<ImageStore>((set, get) => ({
  files: [],
  globalSettings: DEFAULT_SETTINGS,
  applyToAll: true,
  batchProgress: { total: 0, completed: 0, failed: 0, processing: 0 },
  isProcessing: false,
  removedFilesStack: [],
  downloadHistory: [],

  loadSettings: () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('image-optimizer-settings')
        if (saved) {
          set({ globalSettings: { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } })
        }
        const savedHistory = localStorage.getItem('image-optimizer-download-history')
        if (savedHistory) {
          set({ downloadHistory: JSON.parse(savedHistory) })
        }
      } catch (e) {
        console.error('Failed to load settings/history', e)
      }
    }
  },

  addFiles: async (files: File[]) => {
    const existingFiles = get().files.map((f) => f.originalFile)
    const currentGlobalSettings = get().globalSettings
    
    // 1. Validate files in parallel
    const validFiles = await Promise.all(
      files.map(async (file) => {
        const validation = await validateFile(file, existingFiles)
        return { file, validation }
      })
    )

    const filesToProcess = validFiles.filter(({ validation }) => validation.valid).map(({ file }) => file)
    if (filesToProcess.length === 0) return

    // 2. Process all valid files in parallel
    const newFiles = await Promise.all(
      filesToProcess.map((file) => {
        return new Promise<ImageFile>((resolve) => {
          const previewUrl = URL.createObjectURL(file)
          const ext = file.name.toLowerCase().split('.').pop()
          const isPdf = ext === 'pdf' || file.type === 'application/pdf'

          if (isPdf) {
            resolve({
              id: generateId(),
              originalFile: file,
              originalSize: file.size,
              originalDimensions: { width: 0, height: 0 },
              originalPreviewUrl: previewUrl,
              status: 'idle',
              settings: { ...currentGlobalSettings },
            })
            return
          }

          const img = new Image()
          img.onload = () => {
            resolve({
              id: generateId(),
              originalFile: file,
              originalSize: file.size,
              originalDimensions: { width: img.width, height: img.height },
              originalPreviewUrl: previewUrl,
              status: 'idle',
              settings: { ...currentGlobalSettings },
            })
          }
          img.onerror = () => {
            resolve({
              id: generateId(),
              originalFile: file,
              originalSize: file.size,
              originalDimensions: { width: 0, height: 0 },
              originalPreviewUrl: previewUrl,
              status: 'error',
              error: 'Failed to load image preview',
              settings: { ...currentGlobalSettings },
            })
          }
          img.src = previewUrl
        })
      })
    )

    // 3. Update state once
    set((state) => ({
      files: [...state.files, ...newFiles],
      batchProgress: {
        ...state.batchProgress,
        total: state.files.length + newFiles.length,
      },
    }))
  },

  removeFile: (id: string) => {
    set((state) => {
      const file = state.files.find((f) => f.id === id)
      if (file?.originalPreviewUrl) {
        URL.revokeObjectURL(file.originalPreviewUrl)
      }
      if (file?.compressedPreviewUrl) {
        URL.revokeObjectURL(file.compressedPreviewUrl)
      }
      return {
        files: state.files.filter((f) => f.id !== id),
        removedFilesStack: file ? [...state.removedFilesStack, file] : state.removedFilesStack,
        batchProgress: {
          ...state.batchProgress,
          total: Math.max(0, state.batchProgress.total - 1),
        },
      }
    })
  },

  undoLastRemove: () => {
    set((state) => {
      if (state.removedFilesStack.length === 0) return {}
      const nextStack = [...state.removedFilesStack]
      const restoredFile = nextStack.pop()!
      
      // Regenerate preview URLs if they were revoked
      if (restoredFile.originalFile) {
        restoredFile.originalPreviewUrl = URL.createObjectURL(restoredFile.originalFile)
      }
      if (restoredFile.compressedBlob) {
        restoredFile.compressedPreviewUrl = URL.createObjectURL(restoredFile.compressedBlob)
      }
      
      return {
        files: [...state.files, restoredFile],
        removedFilesStack: nextStack,
        batchProgress: {
          ...state.batchProgress,
          total: state.batchProgress.total + 1,
        }
      }
    })
  },

  reorderFiles: (startIndex: number, endIndex: number) => {
    set((state) => {
      const result = Array.from(state.files)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return { files: result }
    })
  },

  updateFile: (id: string, updates: Partial<ImageFile>) => {
    set((state) => ({
      files: state.files.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    }))
  },

  setGlobalSettings: (settings: Partial<CompressionSettings>) => {
    set((state) => {
      const nextSettings = { ...state.globalSettings, ...settings }
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('image-optimizer-settings', JSON.stringify(nextSettings))
        } catch (e) {
          console.error(e)
        }
      }
      return { globalSettings: nextSettings }
    })
  },

  setApplyToAll: (value: boolean) => {
    set({ applyToAll: value })
  },

  setFileSettings: (id: string, settings: Partial<CompressionSettings>) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === id
          ? {
              ...f,
              settings: {
                ...(f.settings || state.globalSettings),
                ...settings,
              },
            }
          : f
      ),
    }))
  },

  processFile: async (id: string) => {
    const state = get()
    const file = state.files.find((f) => f.id === id)
    if (!file) return

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: 'processing' as FileStatus } : f
      ),
      batchProgress: { ...state.batchProgress, processing: state.batchProgress.processing + 1 },
    }))

    try {
      const startTime = performance.now()
      const settings = file.settings || state.globalSettings
      const targetBytes = settings.targetUnit === 'KB' 
        ? settings.targetSize * 1024 
        : settings.targetSize * 1024 * 1024

      const objectUrl = URL.createObjectURL(file.originalFile)
      await new Promise((resolve) => {
        const img = new Image()
        img.onload = async () => {
          try {
            const result = await binarySearchCompress(img, targetBytes, settings)
            const processingTime = performance.now() - startTime
            const compressedPreviewUrl = URL.createObjectURL(result.blob)

            set((state) => ({
              files: state.files.map((f) =>
                f.id === id
                  ? {
                      ...f,
                      status: 'done' as FileStatus,
                      compressedBlob: result.blob,
                      compressedSize: result.blob.size,
                      compressedDimensions: result.dimensions,
                      compressedPreviewUrl,
                      processingTimeMs: processingTime,
                      settings: settings,
                    }
                  : f
              ),
              batchProgress: {
                ...state.batchProgress,
                completed: state.batchProgress.completed + 1,
                processing: Math.max(0, state.batchProgress.processing - 1),
              },
            }))
            resolve(true)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Compression failed'
            set((state) => ({
              files: state.files.map((f) =>
                f.id === id ? { ...f, status: 'error' as FileStatus, error: errorMessage } : f
              ),
              batchProgress: {
                ...state.batchProgress,
                failed: state.batchProgress.failed + 1,
                processing: Math.max(0, state.batchProgress.processing - 1),
              },
            }))
            resolve(false)
          } finally {
            URL.revokeObjectURL(objectUrl)
          }
        }

        img.onerror = () => {
          set((state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, status: 'error' as FileStatus, error: 'Failed to load image for compression' } : f
            ),
            batchProgress: {
              ...state.batchProgress,
              failed: state.batchProgress.failed + 1,
              processing: Math.max(0, state.batchProgress.processing - 1),
            },
          }))
          URL.revokeObjectURL(objectUrl)
          resolve(false)
        }

        img.src = objectUrl
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Processing failed'
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id ? { ...f, status: 'error' as FileStatus, error: errorMessage } : f
        ),
        batchProgress: {
          ...state.batchProgress,
          failed: state.batchProgress.failed + 1,
          processing: Math.max(0, state.batchProgress.processing - 1),
        },
      }))
    }
  },

  processAll: async () => {
    const state = get()
    set({ isProcessing: true })
    
    const CONCURRENCY_LIMIT = 4
    const queue = [...state.files.filter((f) => f.status === 'idle')]
    
    for (let i = 0; i < queue.length; i += CONCURRENCY_LIMIT) {
      const batch = queue.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.all(batch.map((f) => get().processFile(f.id)))
    }

    set({ isProcessing: false })
  },

  downloadFile: (id: string, customName?: string) => {
    const state = get()
    const file = state.files.find((f) => f.id === id)
    if (!file?.compressedBlob) return

    const ext = file.settings?.outputFormat || state.globalSettings.outputFormat
    let filename = customName || `${file.originalFile.name.replace(/\.[^/.]+$/, '')}-compressed`
    if (!filename.endsWith(`.${ext}`)) {
      filename = `${filename}.${ext}`
    }

    const link = document.createElement('a')
    const url = URL.createObjectURL(file.compressedBlob)
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    get().addToHistory({
      id: file.id,
      filename,
      originalSize: file.originalSize,
      compressedSize: file.compressedSize || file.compressedBlob.size,
      format: ext,
    })
  },

  downloadAll: async (renamePattern?: string) => {
    const state = get()
    const completedFiles = state.files.filter(
      (f) => f.status === 'done' && f.compressedBlob
    )
    if (completedFiles.length === 0) return

    const JSZip = (await import('jszip')).default
    const { saveAs } = await import('file-saver')
    
    const zip = new JSZip()
    const dateStr = new Date().toISOString().split('T')[0]

    completedFiles.forEach((file) => {
      if (file.compressedBlob) {
        const ext = file.settings?.outputFormat || state.globalSettings.outputFormat
        const nameWithoutExt = file.originalFile.name.replace(/\.[^/.]+$/, '')
        
        let filename = `${nameWithoutExt}-compressed`
        if (renamePattern) {
          const w = file.compressedDimensions?.width || file.originalDimensions.width
          const h = file.compressedDimensions?.height || file.originalDimensions.height
          filename = renamePattern
            .replace(/{name}/g, nameWithoutExt)
            .replace(/{date}/g, dateStr)
            .replace(/{width}/g, String(w))
            .replace(/{height}/g, String(h))
        }

        if (!filename.endsWith(`.${ext}`)) {
          filename = `${filename}.${ext}`
        }

        zip.file(filename, file.compressedBlob)

        get().addToHistory({
          id: file.id,
          filename,
          originalSize: file.originalSize,
          compressedSize: file.compressedSize || file.compressedBlob.size,
          format: ext,
        })
      }
    })

    const blob = await zip.generateAsync({ type: 'blob' })
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0]
    saveAs(blob, `compressed-images-${timestamp}.zip`)
  },

  clearAll: () => {
    const state = get()
    state.files.forEach((file) => {
      if (file.originalPreviewUrl) {
        URL.revokeObjectURL(file.originalPreviewUrl)
      }
      if (file.compressedPreviewUrl) {
        URL.revokeObjectURL(file.compressedPreviewUrl)
      }
    })
    set({
      files: [],
      batchProgress: { total: 0, completed: 0, failed: 0, processing: 0 },
    })
  },

  clearCompleted: () => {
    const state = get()
    const completedFiles = state.files.filter((f) => f.status === 'done' || f.status === 'error')
    completedFiles.forEach((file) => {
      if (file.originalPreviewUrl) {
        URL.revokeObjectURL(file.originalPreviewUrl)
      }
      if (file.compressedPreviewUrl) {
        URL.revokeObjectURL(file.compressedPreviewUrl)
      }
    })
    set({
      files: state.files.filter((f) => f.status === 'idle' || f.status === 'processing'),
      batchProgress: {
        total: state.files.filter((f) => f.status === 'idle' || f.status === 'processing').length,
        completed: 0,
        failed: 0,
        processing: state.batchProgress.processing,
      },
    })
  },

  addToHistory: (item: Omit<DownloadHistoryItem, 'timestamp'>) => {
    set((state) => {
      const newItem: DownloadHistoryItem = {
        ...item,
        timestamp: Date.now(),
      }
      const newHistory = [newItem, ...state.downloadHistory].slice(0, 50)
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('image-optimizer-download-history', JSON.stringify(newHistory))
        } catch (e) {
          console.error(e)
        }
      }
      return { downloadHistory: newHistory }
    })
  },

  clearHistory: () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('image-optimizer-download-history')
      } catch (e) {
        console.error(e)
      }
    }
    set({ downloadHistory: [] })
  },
}))
