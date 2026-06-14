import { CompressionSettings, ImageDimensions, WorkerMessage } from '@/types'

interface CompressionTask {
  id: string
  imageDataUrl: string
  settings: CompressionSettings
}

const taskQueue: CompressionTask[] = []
let isProcessing = false

self.onmessage = async (event: MessageEvent) => {
  const message = event.data as WorkerMessage

  if (message.type === 'compress') {
    const task = message.payload as CompressionTask
    taskQueue.push(task)
    if (!isProcessing) {
      processQueue()
    }
  }
}

async function processQueue() {
  if (taskQueue.length === 0) {
    isProcessing = false
    return
  }

  isProcessing = true
  const task = taskQueue.shift()
  if (!task) return

  try {
    const { blob, dimensions, processingTimeMs } = await compressImage(
      task.imageDataUrl,
      task.settings
    )

    self.postMessage({
      type: 'result',
      id: task.id,
      blob,
      dimensions,
      processingTimeMs,
    } as WorkerMessage)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    self.postMessage({
      type: 'error',
      id: task.id,
      message,
    } as WorkerMessage)
  }

  processQueue()
}

async function compressImage(
  dataUrl: string,
  settings: CompressionSettings
): Promise<{ blob: Blob; dimensions: ImageDimensions; processingTimeMs: number }> {
  return new Promise((resolve, reject) => {
    const startTime = performance.now()
    const img = new Image()

    img.onload = async () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) throw new Error('Failed to get canvas context')

        if (settings.outputFormat === 'jpg') {
          ctx.fillStyle = settings.backgroundFill
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        const mimeType = getMimeType(settings.outputFormat)
        canvas.toBlob(
          (resultBlob) => {
            if (resultBlob) {
              const processingTime = performance.now() - startTime
              resolve({
                blob: resultBlob,
                dimensions: { width: img.width, height: img.height },
                processingTimeMs: processingTime,
              })
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          mimeType,
          0.8
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = dataUrl
  })
}

function getMimeType(format: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  }
  return mimeTypes[format] || 'image/jpeg'
}

export {}
