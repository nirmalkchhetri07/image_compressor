'use client'

import { useImageStore } from '@/store/imageStore'
import { CompressionMode } from '@/types'
import { COMPRESSION_MODES } from '@/lib/compression/modes'
import { Zap, Target, Maximize2 } from 'lucide-react'

const ModeIcons: Record<CompressionMode, React.ComponentType<{ className?: string }>> = {
  quality: Zap,
  exact: Target,
  resolution: Maximize2,
}

export function ModeSelector() {
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Compression Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Object.entries(COMPRESSION_MODES).map(([key, value]) => {
          const Icon = ModeIcons[key as CompressionMode]
          const isSelected = globalSettings.mode === key

          return (
            <button
              key={key}
              onClick={() => setGlobalSettings({ mode: key as CompressionMode })}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{value.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{value.description}</p>
                  <p className="text-xs text-destructive mt-2 italic">{value.tradeoff}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
