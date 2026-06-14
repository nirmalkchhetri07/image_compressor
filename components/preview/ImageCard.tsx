'use client'

import { ImageFile } from '@/types'
import { BeforeAfter } from './BeforeAfter'
import { memo } from 'react'

interface ImageCardProps {
  file: ImageFile
}

const ImageCard = memo(function ImageCard({ file }: ImageCardProps) {
  if (file.status !== 'done' || !file.compressedBlob) {
    return null
  }

  return (
    <div className="p-6 bg-card border border-gray-200 dark:border-gray-700 rounded-lg">
      <h3 className="font-semibold text-foreground mb-4 truncate">{file.originalFile.name}</h3>
      <BeforeAfter file={file} />
    </div>
  )
}, (prev, next) => prev.file.id === next.file.id && prev.file.status === next.file.status)

export { ImageCard }
