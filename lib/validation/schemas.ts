import { z } from 'zod'
import { CompressionSettings, ResizeMode } from '@/types'

const SizeUnitEnum = z.enum(['KB', 'MB'])

const OutputFormatEnum = z.enum(['jpg', 'png', 'webp', 'avif', 'bmp', 'tiff'])

const CompressionModeEnum = z.enum(['quality', 'exact', 'resolution'])

const ResizeModeEnum = z.enum(['original', 'percentage', 'width', 'height', 'fitWidth', 'fitHeight'])

export const CompressionSettingsSchema = z.object({
  targetSize: z.number().min(1).max(1000),
  targetUnit: SizeUnitEnum,
  mode: CompressionModeEnum,
  outputFormat: OutputFormatEnum,
  resizeMode: ResizeModeEnum,
  resizeValue: z.number().optional(),
  maintainAspectRatio: z.boolean(),
  preserveTransparency: z.boolean(),
  backgroundFill: z.string(),
  maxWidth: z.number().optional(),
  maxHeight: z.number().optional(),
}) satisfies z.ZodType<CompressionSettings>

export const FileUploadInputSchema = z.object({
  files: z.instanceof(FileList).or(z.array(z.instanceof(File))),
})

export const ResizeInputSchema = z.object({
  mode: ResizeModeEnum,
  value: z.number().positive().optional(),
  maxWidth: z.number().positive().optional(),
  maxHeight: z.number().positive().optional(),
})

export const SizeInputSchema = z.object({
  targetSize: z.number().positive().max(1000),
  unit: SizeUnitEnum,
})

export type CompressionSettingsInput = z.infer<typeof CompressionSettingsSchema>
export type FileUploadInput = z.infer<typeof FileUploadInputSchema>
export type ResizeInput = z.infer<typeof ResizeInputSchema>
export type SizeInput = z.infer<typeof SizeInputSchema>
