export type CompressionMode = 'quality' | 'exact' | 'resolution'
export type OutputFormat = 'jpg' | 'png' | 'webp' | 'avif' | 'bmp' | 'tiff' | 'pdf'
export type FileInputType = 'image' | 'pdf'
export type ResizeMode = 'original' | 'percentage' | 'width' | 'height' | 'fitWidth' | 'fitHeight'
export type SizeUnit = 'KB' | 'MB'
export type FileStatus = 'idle' | 'processing' | 'done' | 'error'

export interface ImageDimensions {
  width: number
  height: number
}

export interface CompressionSettings {
  targetSize: number
  targetUnit: SizeUnit
  mode: CompressionMode
  outputFormat: OutputFormat
  resizeMode: ResizeMode
  resizeValue?: number
  maintainAspectRatio: boolean
  preserveTransparency: boolean
  backgroundFill: string
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

export interface ImageFile {
  id: string
  originalFile: File
  originalSize: number
  originalDimensions: ImageDimensions
  originalPreviewUrl: string
  status: FileStatus
  error?: string
  compressedBlob?: Blob
  compressedSize?: number
  compressedDimensions?: ImageDimensions
  compressedPreviewUrl?: string
  processingTimeMs?: number
  settings?: CompressionSettings
}

export interface CompressionResult {
  blob: Blob
  dimensions: ImageDimensions
  processingTimeMs: number
  iterations: number
  achievedSize: number
}

export interface BatchProgress {
  total: number
  completed: number
  failed: number
  processing: number
}

export interface StatsData {
  originalSize: number
  compressedSize: number
  savedBytes: number
  savedPercent: number
  originalDimensions: ImageDimensions
  compressedDimensions: ImageDimensions
  processingTimeMs: number
  outputFormat: string
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export interface WorkerMessage {
  type: 'compress' | 'progress' | 'result' | 'error'
  id: string
  payload: unknown
}
