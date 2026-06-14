'use client'

import { useImageStore } from '@/store/imageStore'

export function useCompression() {
  const processFile = useImageStore((state) => state.processFile)
  const processAll = useImageStore((state) => state.processAll)
  const isProcessing = useImageStore((state) => state.isProcessing)
  const files = useImageStore((state) => state.files)

  const compressFile = async (id: string) => {
    await processFile(id)
  }

  const compressAll = async () => {
    await processAll()
  }

  const isCompressing = isProcessing

  const getFileProgress = (id: string): number => {
    const file = files.find((f) => f.id === id)
    if (!file) return 0
    if (file.status === 'done') return 100
    if (file.status === 'processing') return 50
    if (file.status === 'error') return -1
    return 0
  }

  return {
    compressFile,
    compressAll,
    isCompressing,
    getFileProgress,
  }
}
