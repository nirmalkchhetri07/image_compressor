import { ValidationResult } from '@/types'

const MAX_FILE_SIZE_MB = 50
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff', 'heic', 'pdf']

const MAGIC_BYTES: Record<string, Uint8Array> = {
  jpg: new Uint8Array([0xff, 0xd8, 0xff]),
  png: new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  gif: new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  webp: new Uint8Array([0x52, 0x49, 0x46, 0x46]),
  bmp: new Uint8Array([0x42, 0x4d]),
  tiff_le: new Uint8Array([0x49, 0x49, 0x2a, 0x00]),
  tiff_be: new Uint8Array([0x4d, 0x4d, 0x00, 0x2a]),
  heic: new Uint8Array([0x66, 0x74, 0x79, 0x70]),
  pdf: new Uint8Array([0x25, 0x50, 0x44, 0x46]), // %PDF
}

async function checkMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 4).arrayBuffer()
  const bytes = new Uint8Array(buffer)

  for (const [format, magicBytes] of Object.entries(MAGIC_BYTES)) {
    if (format === 'webp') {
      if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
        const webpBuffer = await file.slice(8, 12).arrayBuffer()
        const webpBytes = new Uint8Array(webpBuffer)
        if (webpBytes[0] === 0x57 && webpBytes[1] === 0x45 && webpBytes[2] === 0x42 && webpBytes[3] === 0x50) {
          return true
        }
      }
    } else if (format === 'heic') {
      const heicBuffer = await file.slice(4, 8).arrayBuffer()
      const heicBytes = new Uint8Array(heicBuffer)
      if (heicBytes[0] === 0x66 && heicBytes[1] === 0x74 && heicBytes[2] === 0x79 && heicBytes[3] === 0x70) {
        return true
      }
    } else {
      let matches = true
      for (let i = 0; i < magicBytes.length; i++) {
        if (bytes[i] !== magicBytes[i]) {
          matches = false
          break
        }
      }
      if (matches) {
        return true
      }
    }
  }

  return false
}

function getFileExtension(filename: string): string {
  const parts = filename.toLowerCase().split('.')
  return parts.length > 1 ? parts[parts.length - 1] : ''
}

function sanitizeFilename(filename: string): string {
  let sanitized = filename
    .replace(/\.\.\//g, '')
    .replace(/\0/g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/[\x00-\x1f]/g, '')

  if (sanitized.length > 200) {
    sanitized = sanitized.substring(0, 200)
  }

  return sanitized
}

function isDuplicate(filename: string, size: number, existingFiles: File[]): boolean {
  return existingFiles.some((f) => f.name === filename && f.size === size)
}

export async function validateFile(file: File, existingFiles: File[] = []): Promise<ValidationResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File exceeds ${MAX_FILE_SIZE_MB} MB limit. Please choose a smaller file.`,
    }
  }

  const ext = getFileExtension(file.name)
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported format. Accepted: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`,
    }
  }

  try {
    const hasValidMagicBytes = await checkMagicBytes(file)
    if (!hasValidMagicBytes) {
      return {
        valid: false,
        error: 'Could not read image. The file may be corrupted.',
      }
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Could not validate file. Please try again.',
    }
  }

  const sanitized = sanitizeFilename(file.name)
  if (isDuplicate(sanitized, file.size, existingFiles)) {
    return {
      valid: false,
      error: 'This file has already been uploaded.',
    }
  }

  return { valid: true }
}

export function sanitizeDownloadFilename(filename: string): string {
  return sanitizeFilename(filename)
}
