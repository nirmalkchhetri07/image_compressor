'use client'

import { useImageStore } from '@/store/imageStore'
import { SizeUnit } from '@/types'

const PRESET_SIZES = [50, 100, 200, 500, 1000, 2000, 5000]

export function SizeInput() {
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Target File Size</h3>

      <div className="flex gap-2">
        <input
          type="number"
          value={globalSettings.targetSize}
          onChange={(e) => setGlobalSettings({ targetSize: Math.max(1, Number(e.target.value)) })}
          className="flex-1 px-3 py-2 bg-background border border-gray-200 dark:border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          min="1"
          max="1000"
        />
        <select
          value={globalSettings.targetUnit}
          onChange={(e) => setGlobalSettings({ targetUnit: e.target.value as SizeUnit })}
          className="px-3 py-2 bg-background border border-gray-200 dark:border-gray-700 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="KB">KB</option>
          <option value="MB">MB</option>
        </select>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick presets:</p>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_SIZES.map((size) => {
            const isKB = size < 1024
            const displaySize = isKB ? size : Math.round(size / 1024 * 10) / 10
            const unit = isKB ? 'KB' : 'MB'

            return (
              <button
                key={size}
                onClick={() => {
                  if (isKB) {
                    setGlobalSettings({ targetSize: size, targetUnit: 'KB' })
                  } else {
                    setGlobalSettings({ targetSize: Math.round(size / 1024 * 10) / 10, targetUnit: 'MB' })
                  }
                }}
                className={`px-2 py-2 rounded text-xs font-medium transition-colors ${
                  globalSettings.targetSize === size && globalSettings.targetUnit === unit
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {displaySize}{unit}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
