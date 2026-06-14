import { OutputFormat } from '@/types'

export interface FormatInfo {
  format: OutputFormat
  label: string
  mimeType: string
  pros: string[]
  cons: string[]
  recommended: boolean
}

export const FORMAT_INFO: Record<OutputFormat, FormatInfo> = {
  jpg: {
    format: 'jpg',
    label: 'JPG',
    mimeType: 'image/jpeg',
    pros: ['Excellent compression', 'Universal browser support', 'Good for photos'],
    cons: ['No transparency', 'Lossy compression', 'Not ideal for graphics'],
    recommended: false,
  },
  png: {
    format: 'png',
    label: 'PNG',
    mimeType: 'image/png',
    pros: ['Full transparency support', 'Lossless compression', 'Good for graphics'],
    cons: ['Larger file sizes', 'Slower to encode', 'Not best for photos'],
    recommended: false,
  },
  webp: {
    format: 'webp',
    label: 'WEBP',
    mimeType: 'image/webp',
    pros: ['Best compression ratio', 'Transparency support', 'Modern format'],
    cons: ['Older browser support', 'Less compatible'],
    recommended: true,
  },
  avif: {
    format: 'avif',
    label: 'AVIF',
    mimeType: 'image/avif',
    pros: ['Best-in-class compression', 'Modern codec', 'Transparency support'],
    cons: ['Limited browser support', 'Slower encoding', 'Fallback to WebP'],
    recommended: true,
  },
  bmp: {
    format: 'bmp',
    label: 'BMP',
    mimeType: 'image/bmp',
    pros: ['Uncompressed', 'Universal support', 'Simple format'],
    cons: ['Very large files', 'No compression', 'Wasteful for photos'],
    recommended: false,
  },
  tiff: {
    format: 'tiff',
    label: 'TIFF',
    mimeType: 'image/tiff',
    pros: ['Lossless compression', 'Professional standard', 'High quality'],
    cons: ['Large files', 'Poor web support', 'Complex format'],
    recommended: false,
  },
}

export function getFormatInfo(format: OutputFormat): FormatInfo {
  return FORMAT_INFO[format]
}

export function supportsTransparency(format: OutputFormat): boolean {
  const transparentFormats: OutputFormat[] = ['png', 'webp', 'avif']
  return transparentFormats.includes(format)
}

export function supportsLossy(format: OutputFormat): boolean {
  const lossyFormats: OutputFormat[] = ['jpg', 'webp', 'avif']
  return lossyFormats.includes(format)
}
