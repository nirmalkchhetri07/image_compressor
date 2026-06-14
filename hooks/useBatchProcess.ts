'use client'

import { useImageStore } from '@/store/imageStore'
import { useCallback, useState } from 'react'

const CONCURRENCY_LIMIT = 4

export function useBatchProcess() {
  const [queue, setQueue] = useState<string[]>([])
  const batchProgress = useImageStore((state) => state.batchProgress)
  const processFile = useImageStore((state) => state.processFile)

  const addToQueue = useCallback((id: string) => {
    setQueue((prev) => {
      if (!prev.includes(id)) {
        return [...prev, id]
      }
      return prev
    })
  }, [])

  const processQueue = useCallback(async () => {
    const currentQueue = [...queue]
    setQueue([])

    for (let i = 0; i < currentQueue.length; i += CONCURRENCY_LIMIT) {
      const batch = currentQueue.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.all(batch.map((id) => processFile(id)))
    }
  }, [queue, processFile])

  const clearQueue = useCallback(() => {
    setQueue([])
  }, [])

  return {
    queue,
    addToQueue,
    processQueue,
    clearQueue,
    batchProgress,
  }
}
