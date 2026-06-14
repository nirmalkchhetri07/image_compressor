export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * Math.pow(10, dm)) / Math.pow(10, dm) + ' ' + sizes[i]
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return (Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)).toFixed(decimals) + '%'
}

export function formatTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return Math.round(milliseconds) + 'ms'
  }
  return (milliseconds / 1000).toFixed(2) + 's'
}
