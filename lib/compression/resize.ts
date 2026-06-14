import { ImageDimensions, ResizeMode } from '@/types'

export interface ResizeOptions {
  mode: ResizeMode
  value?: number
  maintainAspectRatio: boolean
  maxWidth?: number
  maxHeight?: number
}

export function calculateResizedDimensions(
  original: ImageDimensions,
  options: ResizeOptions
): ImageDimensions {
  let width = original.width
  let height = original.height

  switch (options.mode) {
    case 'percentage':
      if (options.value) {
        width = Math.floor(width * (options.value / 100))
        height = Math.floor(height * (options.value / 100))
      }
      break

    case 'width':
      if (options.value) {
        width = options.value
        if (options.maintainAspectRatio) {
          height = Math.floor((width * original.height) / original.width)
        }
      }
      break

    case 'height':
      if (options.value) {
        height = options.value
        if (options.maintainAspectRatio) {
          width = Math.floor((height * original.width) / original.height)
        }
      }
      break

    case 'fitWidth':
      if (options.maxWidth && width > options.maxWidth) {
        width = options.maxWidth
        if (options.maintainAspectRatio) {
          height = Math.floor((width * original.height) / original.width)
        }
      }
      break

    case 'fitHeight':
      if (options.maxHeight && height > options.maxHeight) {
        height = options.maxHeight
        if (options.maintainAspectRatio) {
          width = Math.floor((height * original.width) / original.height)
        }
      }
      break

    case 'original':
    default:
      break
  }

  return { width, height }
}

export function validateResizeDimensions(dimensions: ImageDimensions): boolean {
  return dimensions.width > 0 && dimensions.height > 0 && dimensions.width <= 65535 && dimensions.height <= 65535
}
