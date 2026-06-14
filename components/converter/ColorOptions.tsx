'use client'

import { useImageStore } from '@/store/imageStore'
import { supportsTransparency } from '@/lib/conversion/formats'

export function ColorOptions() {
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)

  const shouldShowBackgroundFill =
    !supportsTransparency(globalSettings.outputFormat) ||
    (globalSettings.outputFormat === 'jpg' && !globalSettings.preserveTransparency)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Color Options</h3>

      <div className="space-y-3">
        {supportsTransparency(globalSettings.outputFormat) && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={globalSettings.preserveTransparency}
              onChange={(e) => setGlobalSettings({ preserveTransparency: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm text-foreground">Preserve transparency</span>
          </label>
        )}

        {shouldShowBackgroundFill && (
          <div className="flex items-center gap-3">
            <label htmlFor="bgColor" className="text-sm text-foreground">
              Background fill color:
            </label>
            <div className="flex items-center gap-2">
              <input
                id="bgColor"
                type="color"
                value={globalSettings.backgroundFill}
                onChange={(e) => setGlobalSettings({ backgroundFill: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-200 dark:border-gray-700"
              />
              <span className="text-sm text-muted-foreground">{globalSettings.backgroundFill}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
