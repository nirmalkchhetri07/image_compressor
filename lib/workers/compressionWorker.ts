import { WorkerMessage } from '@/types'
import { useEffect, useRef } from 'react'

export function useCompressionWorker() {
  const workerRef = useRef<Worker | null>(null)
  const callbacksRef = useRef<Map<string, (data: unknown) => void>>(new Map())

  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../workers/compression.worker.ts', import.meta.url),
      { type: 'module' }
    )

    workerRef.current.onmessage = (event: MessageEvent) => {
      const message = event.data as WorkerMessage
      const callback = callbacksRef.current.get(message.id)
      if (callback) {
        callback(message)
        callbacksRef.current.delete(message.id)
      }
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

  const compress = (
    id: string,
    imageDataUrl: string,
    settings: unknown,
    onMessage: (message: unknown) => void
  ) => {
    callbacksRef.current.set(id, onMessage)
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'compress',
        id,
        payload: {
          id,
          imageDataUrl,
          settings,
        },
      } as WorkerMessage)
    }
  }

  return { compress }
}
