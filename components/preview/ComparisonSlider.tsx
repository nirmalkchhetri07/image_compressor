'use client'

import { useState, useRef, useEffect } from 'react'

interface ComparisonSliderProps {
  beforeImage: string
  afterImage: string
}

export function ComparisonSlider({ beforeImage, afterImage }: ComparisonSliderProps) {
  const [position, setPosition] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = () => setIsDragging(true)
  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const newPosition = ((e.clientX - rect.left) / rect.width) * 100
      setPosition(Math.max(0, Math.min(100, newPosition)))
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      setPosition((prev) => Math.max(0, prev - 5))
    } else if (e.key === 'ArrowRight') {
      setPosition((prev) => Math.min(100, prev + 5))
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden cursor-col-resize group"
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      role="slider"
      tabIndex={0}
      aria-label="Image comparison slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={position}
    >
      <img src={beforeImage} alt="Before" className="absolute inset-0 w-full h-full object-cover" />

      <div
        className="absolute inset-0 w-full h-full object-cover overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img src={afterImage} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      </div>

      <div
        className="absolute top-0 bottom-0 w-1 bg-primary transition-colors group-hover:w-1.5"
        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary rounded-full shadow-lg flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-0.5 h-3 bg-white"></div>
            <div className="w-0.5 h-3 bg-white"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
