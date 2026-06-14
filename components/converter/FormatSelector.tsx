'use client'

import { useImageStore } from '@/store/imageStore'
import { OutputFormat } from '@/types'
import { FORMAT_INFO } from '@/lib/conversion/formats'

export function FormatSelector() {
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)

  const formats: OutputFormat[] = ['jpg', 'png', 'webp', 'avif', 'bmp', 'tiff']

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Output Format</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {formats.map((format) => {
          const info = FORMAT_INFO[format]
          const isSelected = globalSettings.outputFormat === format

          return (
            <button
              key={format}
              onClick={() => setGlobalSettings({ outputFormat: format })}
              className={`relative p-3 rounded-lg border-2 transition-all text-center group ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700 bg-card hover:border-primary/50'
              }`}
              title={info.label}
            >
              <div className="font-medium text-foreground">{info.label}</div>
              {info.recommended && (
                <div className="text-xs text-primary font-semibold mt-1">Recommended</div>
              )}

              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-foreground text-background text-xs rounded p-2 w-40 whitespace-normal">
                  <p className="font-semibold mb-1">{info.label}</p>
                  <p className="text-left">Pros: {info.pros.join(', ')}</p>
                  <p className="text-left">Cons: {info.cons.join(', ')}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
