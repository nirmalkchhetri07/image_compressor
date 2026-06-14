export function sanitizeFilename(filename: string): string {
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

export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

export function getFileNameWithoutExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.')
  return lastDotIndex === -1 ? filename : filename.substring(0, lastDotIndex)
}
