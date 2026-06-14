'use client'

import { useImageStore } from '@/store/imageStore'
import { formatBytes, formatPercentage } from '@/utils/formatBytes'
import { MetricCard } from './MetricCard'
import { HardDrive, Zap, TrendingDown, Clock } from 'lucide-react'

export function StatsDashboard() {
  const files = useImageStore((state) => state.files)
  const completedFiles = files.filter((f) => f.status === 'done')

  if (completedFiles.length === 0) {
    return null
  }

  const totalOriginalSize = completedFiles.reduce((sum, f) => sum + f.originalSize, 0)
  const totalCompressedSize = completedFiles.reduce((sum, f) => sum + (f.compressedSize || 0), 0)
  const totalSavedBytes = totalOriginalSize - totalCompressedSize
  const totalSavedPercent = (totalSavedBytes / totalOriginalSize) * 100
  const avgProcessingTime = completedFiles.reduce((sum, f) => sum + (f.processingTimeMs || 0), 0) / completedFiles.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={HardDrive}
          label="Total Saved"
          value={formatBytes(totalSavedBytes)}
          color="green"
        />
        <MetricCard
          icon={Zap}
          label="Compression Ratio"
          value={formatPercentage(totalSavedPercent)}
          color="blue"
        />
        <MetricCard
          icon={TrendingDown}
          label="Original Size"
          value={formatBytes(totalOriginalSize)}
          color="neutral"
        />
        <MetricCard
          icon={Clock}
          label="Avg Processing"
          value={`${avgProcessingTime.toFixed(0)}ms`}
          color="purple"
        />
      </div>

      <div className="bg-card border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <h3 className="font-semibold text-foreground mb-4">Files Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left text-muted-foreground">
                <th className="pb-2 font-medium">File Name</th>
                <th className="pb-2 font-medium">Original</th>
                <th className="pb-2 font-medium">Compressed</th>
                <th className="pb-2 font-medium">Saved</th>
              </tr>
            </thead>
            <tbody>
              {completedFiles.map((file) => {
                const saved = file.originalSize - (file.compressedSize || 0)
                const savedPercent = (saved / file.originalSize) * 100
                return (
                  <tr key={file.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-muted/50 transition-colors">
                    <td className="py-3 text-foreground truncate">{file.originalFile.name}</td>
                    <td className="py-3 text-muted-foreground">{formatBytes(file.originalSize)}</td>
                    <td className="py-3 text-muted-foreground">{formatBytes(file.compressedSize || 0)}</td>
                    <td className="py-3 text-green-600 dark:text-green-400 font-medium">
                      {formatBytes(saved)} ({formatPercentage(savedPercent)})
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
