import { OutputFormat } from '@/types'

export interface ConversionOptions {
  quality?: number
  preserveTransparency?: boolean
  backgroundFill?: string
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

async function convertFormat(
  blob: Blob,
  targetFormat: OutputFormat,
  options: ConversionOptions = {}
): Promise<Blob> {
  const url = URL.createObjectURL(blob)

  try {
    return await new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = async () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        if (targetFormat === 'jpg' && options.backgroundFill) {
          ctx.fillStyle = options.backgroundFill
          ctx.fillRect(0, 0, canvas.width, canvas.height)
        }

        ctx.drawImage(img, 0, 0)

        try {
          const mimeType = getMimeType(targetFormat)
          const quality = options.quality ?? (targetFormat === 'jpg' ? 0.8 : 0.9)

          canvas.toBlob(
            (resultBlob) => {
              if (resultBlob) {
                resolve(resultBlob)
              } else {
                reject(new Error(`Failed to convert to ${targetFormat}`))
              }
            },
            mimeType,
            quality
          )
        } catch (error) {
          if (targetFormat === 'avif') {
            const webpMimeType = getMimeType('webp')
            canvas.toBlob(
              (resultBlob) => {
                if (resultBlob) {
                  resolve(resultBlob)
                } else {
                  reject(new Error('Failed to convert to WebP fallback'))
                }
              },
              webpMimeType,
              options.quality ?? 0.9
            )
          } else {
            reject(error)
          }
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

export { convertFormat }

