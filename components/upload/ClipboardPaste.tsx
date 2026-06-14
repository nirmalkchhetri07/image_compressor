'use client'

import { useClipboard } from '@/hooks/useClipboard'
import { Clipboard } from 'lucide-react'

export function ClipboardPaste() {
  useClipboard()

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <Clipboard className="w-3 h-3" />
      You can also paste images using Ctrl+V or Cmd+V
    </div>
  )
}
