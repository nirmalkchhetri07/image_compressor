import { CompressionSettings, CompressionResult, ImageDimensions, OutputFormat } from '@/types'
import { convertFormat } from '@/lib/conversion/converter'

interface ResizeOptions {
  mode: CompressionSettings['resizeMode']
  value?: number
  maintainAspectRatio: boolean
  maxWidth?: number
  maxHeight?: number
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = getMimeType(format)
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to convert canvas to blob'))
        }
      },
      mimeType,
      quality
    )
  })
}

function getMimeType(format: OutputFormat): string {
  const mimeTypes: Record<OutputFormat, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    avif: 'image/avif',
    bmp: 'image/bmp',
    tiff: 'image/tiff',
  }
  return mimeTypes[format]
}

function getCanvasDimensions(
  img: HTMLImageElement,
  resizeOptions: ResizeOptions
): ImageDimensions {
  let width = img.width
  let height = img.height

  if (resizeOptions.mode === 'percentage' && resizeOptions.value) {
    width = Math.floor(width * (resizeOptions.value / 100))
    height = Math.floor(height * (resizeOptions.value / 100))
  } else if (resizeOptions.mode === 'width' && resizeOptions.value) {
    width = resizeOptions.value
    if (resizeOptions.maintainAspectRatio) {
      height = Math.floor((width * img.height) / img.width)
    }
  } else if (resizeOptions.mode === 'height' && resizeOptions.value) {
    height = resizeOptions.value
    if (resizeOptions.maintainAspectRatio) {
      width = Math.floor((height * img.width) / img.height)
    }
  } else if (resizeOptions.mode === 'fitWidth' && resizeOptions.maxWidth) {
    if (width > resizeOptions.maxWidth) {
      width = resizeOptions.maxWidth
      if (resizeOptions.maintainAspectRatio) {
        height = Math.floor((width * img.height) / img.width)
      }
    }
  } else if (resizeOptions.mode === 'fitHeight' && resizeOptions.maxHeight) {
    if (height > resizeOptions.maxHeight) {
      height = resizeOptions.maxHeight
      if (resizeOptions.maintainAspectRatio) {
        width = Math.floor((height * img.width) / img.height)
      }
    }
  }

  return { width, height }
}

async function drawImageToCanvas(
  img: HTMLImageElement,
  dimensions: ImageDimensions,
  format: OutputFormat,
  backgroundFill: string
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = dimensions.width
  canvas.height = dimensions.height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to get canvas context')

  if (format === 'jpg' && img.naturalWidth > 0) {
    ctx.fillStyle = backgroundFill
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height)
  return canvas
}

async function compressWithQuality(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality: number,
  backgroundFill: string
): Promise<Blob> {
  try {
    const blob = await canvasToBlob(canvas, format, quality)
    return blob
  } catch {
    throw new Error(`Failed to compress with quality ${quality}`)
  }
}

async function binarySearchCompress(
  imageElement: HTMLImageElement,
  targetBytes: number,
  settings: CompressionSettings
): Promise<CompressionResult> {
  const resizeOptions: ResizeOptions = {
    mode: settings.resizeMode,
    value: settings.resizeValue,
    maintainAspectRatio: settings.maintainAspectRatio,
    maxWidth: settings.maxWidth,
    maxHeight: settings.maxHeight,
  }

  let currentDimensions = getCanvasDimensions(imageElement, resizeOptions)

  if (settings.mode === 'resolution') {
    currentDimensions = {
      width: Math.floor(currentDimensions.width * 0.5),
      height: Math.floor(currentDimensions.height * 0.5),
    }
  }

  let minQuality = 0.1
  let maxQuality = 1.0
  let bestBlob: Blob | null = null
  let bestDimensions = currentDimensions
  let iterations = 0
  const maxIterations = 20
  const tolerance = settings.mode === 'exact' ? 0.02 : settings.mode === 'quality' ? 0.1 : 0.05

  let dimensionReductionCycles = 0
  const maxDimensionCycles = 5

  while (dimensionReductionCycles < maxDimensionCycles) {
    minQuality = 0.1
    maxQuality = 1.0
    iterations = 0

    while (iterations < maxIterations) {
      iterations++
      const midQuality = (minQuality + maxQuality) / 2

      const canvas = await drawImageToCanvas(
        imageElement,
        currentDimensions,
        settings.outputFormat,
        settings.backgroundFill
      )

      const blob = await compressWithQuality(
        canvas,
        settings.outputFormat,
        midQuality,
        settings.backgroundFill
      )

      const sizeDiff = Math.abs(blob.size - targetBytes) / targetBytes

      if (sizeDiff <= tolerance) {
        return {
          blob,
          dimensions: currentDimensions,
          processingTimeMs: 0,
          iterations: iterations + dimensionReductionCycles * maxIterations,
          achievedSize: blob.size,
        }
      }

      if (blob.size > targetBytes) {
        maxQuality = midQuality
      } else {
        minQuality = midQuality
        bestBlob = blob
        bestDimensions = currentDimensions
      }
    }

    if (bestBlob && bestBlob.size <= targetBytes) {
      return {
        blob: bestBlob,
        dimensions: bestDimensions,
        processingTimeMs: 0,
        iterations: iterations + dimensionReductionCycles * maxIterations,
        achievedSize: bestBlob.size,
      }
    }

    currentDimensions = {
      width: Math.floor(currentDimensions.width * 0.9),
      height: Math.floor(currentDimensions.height * 0.9),
    }
    dimensionReductionCycles++
  }

  throw new Error('Could not achieve target size. Try a larger target or lower compression requirement.')
}

export { binarySearchCompress }
export type { ResizeOptions }
