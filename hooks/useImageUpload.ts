'use client'

import { useRef, useState } from 'react'
import { useImageStore } from '@/store/imageStore'

export function useImageUpload() {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addFiles = useImageStore((state) => state.addFiles)

  const handleFileInput = async (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      await addFiles(fileArray)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    await handleFileInput(files)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return {
    isDragging,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    openFilePicker,
    fileInputRef,
  }
}
