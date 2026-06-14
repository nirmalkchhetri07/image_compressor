'use client'

import { useEffect, useRef } from 'react'
import { useImageStore } from '@/store/imageStore'

export function useClipboard() {
  const isListeningRef = useRef(false)
  const addFiles = useImageStore((state) => state.addFiles)

  const handlePaste = async (e: ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const file = items[i].getAsFile()
        if (file) {
          files.push(file)
        }
      }
    }

    if (files.length > 0) {
      await addFiles(files)
    }
  }

  useEffect(() => {
    if (!isListeningRef.current) {
      window.addEventListener('paste', handlePaste as any)
      isListeningRef.current = true
    }

    return () => {
      window.removeEventListener('paste', handlePaste as any)
      isListeningRef.current = false
    }
  }, [])

  return {
    handlePaste,
    isListening: isListeningRef.current,
  }
}
