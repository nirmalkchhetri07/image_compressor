'use client'

import { useImageStore } from '@/store/imageStore'
import { Download, Loader2 } from 'lucide-react'
import { useState } from 'react'

export function BatchDownload() {
  const files = useImageStore((state) => state.files)
  const downloadAll = useImageStore((state) => state.downloadAll)
  const [isDownloading, setIsDownloading] = useState(false)

  const completedFiles = files.filter((f) => f.status === 'done' && f.compressedBlob)

  if (completedFiles.length === 0) {
    return null
  }

  const handleDownloadAll = async () => {
    setIsDownloading(true)
    try {
      await downloadAll()
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <button
      onClick={handleDownloadAll}
      disabled={isDownloading}
      className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
      aria-label="Download all images as ZIP"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Preparing ZIP...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Download All ({completedFiles.length})
        </>
      )}
    </button>
  )
}
