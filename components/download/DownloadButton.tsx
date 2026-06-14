'use client'

import { useImageStore } from '@/store/imageStore'
import { formatBytes } from '@/utils/formatBytes'
import { Download } from 'lucide-react'
import { memo } from 'react'

interface DownloadButtonProps {
  fileId: string
}

const DownloadButton = memo(function DownloadButton({ fileId }: DownloadButtonProps) {
  const files = useImageStore((state) => state.files)
  const downloadFile = useImageStore((state) => state.downloadFile)

  const file = files.find((f) => f.id === fileId)

  if (!file || file.status !== 'done' || !file.compressedBlob) {
    return null
  }

  return (
    <button
      onClick={() => downloadFile(fileId)}
      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
      aria-label={`Download ${file.originalFile.name}`}
    >
      <Download className="w-4 h-4" />
      Download ({formatBytes(file.compressedSize || 0)})
    </button>
  )
}, (prev, next) => prev.fileId === next.fileId)

export { DownloadButton }
