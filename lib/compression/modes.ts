import { CompressionMode } from '@/types'

export const COMPRESSION_MODES: Record<CompressionMode, { title: string; description: string; tradeoff: string }> = {
  quality: {
    title: 'Quality Priority',
    description: 'Prioritizes image quality with higher compression ratios. Best for photos.',
    tradeoff: 'File size may be slightly larger than exact target.',
  },
  exact: {
    title: 'Exact Size',
    description: 'Achieves precise target file size with strict tolerance.',
    tradeoff: 'May result in lower quality if target is very small.',
  },
  resolution: {
    title: 'Resolution Priority',
    description: 'Reduces dimensions first, then optimizes quality. Best for thumbnails.',
    tradeoff: 'Image may have different aspect ratio.',
  },
}

export function getDefaultQualityByMode(mode: CompressionMode): number {
  const defaults: Record<CompressionMode, number> = {
    quality: 0.8,
    exact: 0.6,
    resolution: 0.7,
  }
  return defaults[mode]
}

export function getToleranceByMode(mode: CompressionMode): number {
  const tolerances: Record<CompressionMode, number> = {
    quality: 0.1,
    exact: 0.02,
    resolution: 0.05,
  }
  return tolerances[mode]
}
