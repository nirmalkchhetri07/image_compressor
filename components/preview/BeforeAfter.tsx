'use client'

import { ImageFile, OutputFormat } from '@/types'
import { formatBytes, formatPercentage } from '@/utils/formatBytes'
import { ComparisonSlider } from './ComparisonSlider'
import { memo, useState } from 'react'
import { Image, Columns, Split, Sparkles, Check } from 'lucide-react'

interface BeforeAfterProps {
  file: ImageFile
}

const BeforeAfter = memo(function BeforeAfter({ file }: BeforeAfterProps) {
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side'>('slider')

  if (!file.compressedBlob) return (
    <div className="flex flex-col items-center justify-center py-12 bg-slate-950/20 border border-slate-800 rounded-xl">
      <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
      <p className="text-sm text-slate-400 font-semibold">Image is being compressed...</p>
    </div>
  )

  const savedBytes = file.originalSize - (file.compressedSize || 0)
  const savedPercent = (savedBytes / file.originalSize) * 100

  // Format Recommendations & Estimated Savings list
  const getFormatRecommendations = (): { format: OutputFormat; savings: string; label: string; desc: string; recommended: boolean }[] => {
    const isPng = file.originalFile.type === 'image/png' || file.originalFile.name.endsWith('.png')
    
    return [
      {
        format: 'webp',
        label: 'WebP',
        savings: '↓ 70% - 85%',
        desc: 'Best balance of quality & file size. Full transparency support.',
        recommended: true
      },
      {
        format: 'jpg',
        label: 'JPEG',
        savings: '↓ 65% - 80%',
        desc: 'Universal support. Best for photos. No transparency.',
        recommended: !isPng
      },
      {
        format: 'png',
        label: 'PNG',
        savings: '↓ 5% - 15%',
        desc: 'Lossless quality. Retains crisp lines & text. Large file size.',
        recommended: false
      },
      {
        format: 'avif',
        label: 'AVIF',
        savings: '↓ 80% - 90%',
        desc: 'Next-gen compression. Best size savings. Limited browser support.',
        recommended: isPng
      }
    ]
  }

  const recommendations = getFormatRecommendations()

  return (
    <div className="space-y-6">
      {/* Comparison View Controls */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Comparison View
        </span>
        <div className="flex p-0.5 bg-slate-950/60 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('slider')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'slider'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              viewMode === 'side-by-side'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            Side by Side
          </button>
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="border border-slate-800 bg-slate-950/40 rounded-2xl overflow-hidden p-3">
        {viewMode === 'slider' ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800">
            <ComparisonSlider
              beforeImage={file.originalPreviewUrl}
              afterImage={file.compressedPreviewUrl || ''}
            />
            {/* Overlay indicators */}
            <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/75 text-white text-[10px] font-bold rounded shadow-md pointer-events-none">
              Original
            </div>
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-blue-500/85 text-white text-[10px] font-bold rounded shadow-md pointer-events-none">
              Compressed
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original Card */}
            <div className="space-y-2">
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <img
                  src={file.originalPreviewUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded shadow-md">
                  Original
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-slate-400">{file.originalDimensions.width}×{file.originalDimensions.height}</span>
                <span className="text-xs text-white font-bold">{formatBytes(file.originalSize)}</span>
              </div>
            </div>

            {/* Compressed Card */}
            <div className="space-y-2">
              <div className="relative aspect-video bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <img
                  src={file.compressedPreviewUrl}
                  alt="Compressed"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 px-2 py-1 bg-blue-500/70 text-white text-[10px] font-bold rounded shadow-md">
                  Compressed
                </div>
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-xs text-slate-400">
                  {file.compressedDimensions?.width}×{file.compressedDimensions?.height}
                </span>
                <span className="text-xs text-blue-400 font-bold">{formatBytes(file.compressedSize || 0)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Compression statistics banner */}
      <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs font-bold text-green-400 uppercase tracking-wider block">Savings Summary</span>
          <span className="text-sm font-semibold text-slate-200 mt-0.5 block">
            Saved {formatBytes(savedBytes)} ({formatPercentage(savedPercent)})
          </span>
        </div>
        
        {file.processingTimeMs && (
          <span className="px-3 py-1 bg-slate-950/60 border border-slate-800 text-slate-400 text-xs font-semibold rounded-lg">
            Time: {file.processingTimeMs.toFixed(0)}ms
          </span>
        )}
      </div>

      {/* Recommended Format & Savings grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          Format Savings & Recommendations
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recommendations.map((rec) => (
            <div
              key={rec.format}
              className={`p-3 border rounded-xl relative transition-all ${
                rec.recommended
                  ? 'border-blue-500 bg-blue-500/5'
                  : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
              }`}
            >
              {rec.recommended && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[8px] font-extrabold uppercase rounded flex items-center gap-0.5">
                  <Sparkles className="w-2 h-2" />
                  Best Choice
                </span>
              )}
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white">{rec.label}</span>
                <span className="text-[10px] text-green-400 font-bold">{rec.savings}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal mt-1 pr-12">
                {rec.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}, (prev, next) => prev.file.id === next.file.id && prev.file.status === next.file.status && prev.file.compressedSize === next.file.compressedSize)

export { BeforeAfter }
