'use client'

import { Upload, CheckCircle } from 'lucide-react'
import { useImageUpload } from '@/hooks/useImageUpload'
import { useState } from 'react'

interface DropZoneProps {
  compact?: boolean
}

export function DropZone({ compact = false }: DropZoneProps) {
  const { isDragging, handleDrop, handleDragOver, handleDragLeave, openFilePicker, fileInputRef, handleFileInput } = useImageUpload()
  const [isHovering, setIsHovering] = useState(false)

  const supportedFormats = ['JPG', 'PNG', 'WEBP', 'GIF', 'BMP', 'TIFF', 'HEIC']

  if (compact) {
    return (
      <div
        onDragOver={(e) => {
          handleDragOver(e)
          setIsHovering(true)
        }}
        onDragLeave={(e) => {
          handleDragLeave(e)
          setIsHovering(false)
        }}
        onDrop={(e) => {
          handleDrop(e)
          setIsHovering(false)
        }}
        onClick={openFilePicker}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className={`w-full p-4 border border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
          isDragging || isHovering
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-slate-700/50 bg-slate-900/30 hover:border-blue-500/50 hover:bg-slate-800/30'
        }`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            openFilePicker()
          }
        }}
        aria-label="Upload images by clicking or dragging"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileInput(e.target.files)}
          className="hidden"
          aria-hidden="true"
        />
        <div className="flex items-center justify-center gap-3">
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-200">
            {isHovering ? 'Drop files here!' : 'Drop files or click to add'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        handleDragOver(e)
        setIsHovering(true)
      }}
      onDragLeave={(e) => {
        handleDragLeave(e)
        setIsHovering(false)
      }}
      onDrop={(e) => {
        handleDrop(e)
        setIsHovering(false)
      }}
      onClick={openFilePicker}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`w-full p-12 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
        isDragging || isHovering
          ? 'border-primary bg-primary/5 scale-105'
          : 'border-gray-200 dark:border-gray-700 bg-card hover:border-primary/50 hover:bg-primary/2.5'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openFilePicker()
        }
      }}
      aria-label="Upload images by clicking or dragging"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleFileInput(e.target.files)}
        className="hidden"
        aria-hidden="true"
      />

      <div className="flex flex-col items-center justify-center gap-4">
        {isHovering ? (
          <CheckCircle className="w-12 h-12 text-primary animate-pulse" />
        ) : (
          <Upload className="w-12 h-12 text-muted-foreground" />
        )}

        <div className="text-center">
          <h3 className="font-semibold text-lg text-foreground">Drop your images here</h3>
          <p className="text-sm text-muted-foreground mt-1">or click to browse from your device</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {supportedFormats.map((format) => (
            <span
              key={format}
              className="px-3 py-1 text-xs bg-secondary text-secondary-foreground rounded-full"
            >
              {format}
            </span>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">Max file size: 50 MB</p>
      </div>
    </div>
  )
}
