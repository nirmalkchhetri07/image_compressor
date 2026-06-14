'use client'

import { useImageStore } from '@/store/imageStore'
import { CompressionMode, SizeUnit, CompressionSettings as SettingsType, OutputFormat, ResizeMode } from '@/types'
import { COMPRESSION_MODES } from '@/lib/compression/modes'
import { RotateCcw, ChevronDown, ChevronUp, AlertTriangle, Sparkles, Sliders, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

const DEFAULT_SETTINGS = {
  targetSize: 200,
  targetUnit: 'KB' as SizeUnit,
  mode: 'quality' as CompressionMode,
  outputFormat: 'webp' as const,
  resizeMode: 'original' as const,
  maintainAspectRatio: true,
  preserveTransparency: true,
  backgroundFill: '#ffffff',
  quality: 80,
}

interface CompressionSettingsProps {
  selectedFileId: string | null
  setSelectedFileId?: (id: string | null) => void
  showToast?: (message: string, type: 'success' | 'info' | 'warning') => void
}

export function CompressionSettings({ selectedFileId, setSelectedFileId, showToast }: CompressionSettingsProps) {
  const globalSettings = useImageStore((state) => state.globalSettings)
  const setGlobalSettings = useImageStore((state) => state.setGlobalSettings)
  const applyToAll = useImageStore((state) => state.applyToAll)
  const setApplyToAll = useImageStore((state) => state.setApplyToAll)
  const files = useImageStore((state) => state.files)
  const setFileSettings = useImageStore((state) => state.setFileSettings)

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<'global' | 'file'>('global')

  // Find currently selected file
  const selectedFile = files.find((f) => f.id === selectedFileId)

  // Sync editing target tab when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setEditingTarget('file')
    } else {
      setEditingTarget('global')
    }
  }, [selectedFileId, selectedFile])

  // Get active settings (either custom file settings or global settings)
  const activeSettings: SettingsType =
    editingTarget === 'file' && selectedFile?.settings
      ? { ...globalSettings, ...selectedFile.settings }
      : globalSettings

  // Update setting field helper
  const updateSetting = (updates: Partial<SettingsType>) => {
    if (editingTarget === 'file' && selectedFileId) {
      setFileSettings(selectedFileId, updates)
      if (showToast) showToast(`Updated settings for ${selectedFile?.originalFile.name}`, 'info')
    } else {
      setGlobalSettings(updates)
    }
  }

  // Calculate dynamic slider bounds
  const isKB = activeSettings.targetUnit === 'KB'
  const sliderMin = isKB ? 10 : 0.1
  const sliderMax = isKB ? 2000 : 10
  const sliderStep = isKB ? 10 : 0.1

  // Handle slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value)
    updateSetting({ targetSize: val })
  }

  // Size Validation: Check if size is too low
  const getValidationWarning = () => {
    if (editingTarget === 'file' && selectedFile) {
      const targetInBytes = activeSettings.targetUnit === 'KB'
        ? activeSettings.targetSize * 1024
        : activeSettings.targetSize * 1024 * 1024
      const sizeRatio = targetInBytes / selectedFile.originalSize
      
      if (sizeRatio < 0.05) {
        return 'Target size is extremely small (< 5% of original). Quality may drop severely.'
      }
    }
    return null
  }

  const warning = getValidationWarning()

  // Suggest optimal target size based on image dimensions
  const getOptimalSize = () => {
    if (editingTarget === 'file' && selectedFile) {
      const width = selectedFile.originalDimensions.width
      const height = selectedFile.originalDimensions.height
      // WebP baseline estimate: 0.15 bytes per pixel
      const optimalBytes = width * height * 0.15
      const optimalKB = Math.max(15, Math.round(optimalBytes / 1024))
      
      if (activeSettings.targetUnit === 'KB') {
        return { value: optimalKB, unit: 'KB' as SizeUnit }
      } else {
        const optimalMB = Math.round((optimalKB / 1024) * 10) / 10
        return { value: Math.max(0.1, optimalMB), unit: 'MB' as SizeUnit }
      }
    }
    return null
  }

  const optimalSuggestion = getOptimalSize()

  const handleApplyOptimal = () => {
    if (optimalSuggestion) {
      updateSetting({
        targetSize: optimalSuggestion.value,
        targetUnit: optimalSuggestion.unit,
      })
      if (showToast) showToast('Applied recommended optimal size!', 'success')
    }
  }

  const handleResetSettings = () => {
    if (editingTarget === 'file' && selectedFileId) {
      setFileSettings(selectedFileId, { ...globalSettings })
      if (showToast) showToast('Reset image settings to global defaults', 'info')
    } else {
      setGlobalSettings(DEFAULT_SETTINGS)
      if (showToast) showToast('Reset global settings to defaults', 'info')
    }
  }

  return (
    <div className="space-y-5 p-6 bg-slate-900/60 border border-slate-700/50 rounded-2xl shadow-xl backdrop-blur-xl">
      {/* Settings Target Tabs */}
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
        <div className="flex gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setEditingTarget('global')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              editingTarget === 'global'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Global Settings
          </button>
          <button
            onClick={() => {
              if (selectedFile) {
                setEditingTarget('file')
              } else if (showToast) {
                showToast('Please select an image from the list first', 'warning')
              }
            }}
            disabled={!selectedFile}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
              editingTarget === 'file'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : selectedFile
                ? 'text-slate-400 hover:text-slate-200'
                : 'text-slate-600 cursor-not-allowed'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            File Overrides
          </button>
        </div>

        <button
          onClick={handleResetSettings}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Reset to defaults"
          aria-label="Reset settings to defaults"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Editing target banner */}
      {editingTarget === 'file' && selectedFile && (
        <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
          <span className="text-xs text-blue-300 font-medium truncate max-w-[200px]">
            Overrides for: {selectedFile.originalFile.name}
          </span>
          <button
            onClick={() => setEditingTarget('global')}
            className="text-[10px] text-blue-400 hover:text-blue-300 underline font-semibold"
          >
            Switch to Global
          </button>
        </div>
      )}

      {/* Quick Settings Section */}
      <div className="space-y-4">
        {/* Target Size */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Target File Size
            </label>
            <span className="text-xs text-slate-400 font-medium">
              Range: {sliderMin}{activeSettings.targetUnit} - {sliderMax}{activeSettings.targetUnit}
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="number"
              value={activeSettings.targetSize}
              onChange={(e) => updateSetting({ targetSize: Math.max(1, parseFloat(e.target.value) || 0) })}
              className="flex-1 px-4 py-2.5 bg-slate-950/80 border border-slate-700/60 rounded-xl text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all duration-200 font-semibold text-sm"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
            />
            <select
              value={activeSettings.targetUnit}
              onChange={(e) => updateSetting({ targetUnit: e.target.value as SizeUnit })}
              className="px-3 py-2.5 bg-slate-950/80 border border-slate-700/60 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 font-bold text-sm cursor-pointer"
            >
              <option value="KB">KB</option>
              <option value="MB">MB</option>
            </select>
          </div>

          {/* Size slider */}
          <div className="pt-2">
            <input
              type="range"
              min={sliderMin}
              max={sliderMax}
              step={sliderStep}
              value={activeSettings.targetSize}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Output Format */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Output Format
          </label>
          <select
            value={activeSettings.outputFormat}
            onChange={(e) => updateSetting({ outputFormat: e.target.value as OutputFormat })}
            className="w-full px-4 py-2.5 bg-slate-950/80 border border-slate-700/60 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-200 font-semibold text-sm cursor-pointer"
          >
            <option value="webp">WebP (Best Compression)</option>
            <option value="jpg">JPG (Best Compatibility)</option>
            <option value="png">PNG (Lossless & Transparency)</option>
            <option value="avif">AVIF (Ultra High Quality)</option>
            <option value="bmp">BMP (Uncompressed)</option>
            <option value="tiff">TIFF (Professional Print)</option>
          </select>
        </div>

        {/* Validation Warning & Suggestion Drawer */}
        {warning && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300/90 leading-relaxed font-medium">{warning}</p>
          </div>
        )}

        {editingTarget === 'file' && selectedFile && optimalSuggestion && (
          <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">
                Recommended optimal target:
              </span>
            </div>
            <button
              onClick={handleApplyOptimal}
              className="px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-[10px] transition-colors flex items-center gap-1 shadow-md shadow-blue-500/10"
            >
              Apply {optimalSuggestion.value} {optimalSuggestion.unit}
            </button>
          </div>
        )}
      </div>

      {/* Advanced Settings Divider & Accordion */}
      <div className="border-t border-slate-800 pt-4">
        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" />
            Advanced Parameters
          </span>
          {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isAdvancedOpen && (
          <div className="space-y-4 pt-4 animate-in fade-in duration-200">
            {/* Compression Mode */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Compression Strategy
              </label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(COMPRESSION_MODES).map(([key, value]) => {
                  const isSelected = activeSettings.mode === key
                  return (
                    <button
                      key={key}
                      onClick={() => updateSetting({ mode: key as CompressionMode })}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-500/5 shadow-md shadow-blue-500/5'
                          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white">{value.title}</span>
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-3.5 h-3.5 accent-blue-500 cursor-pointer"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {value.description}
                      </p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quality Slider (visible if mode is NOT exact) */}
            {activeSettings.mode !== 'exact' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Base Quality
                  </label>
                  <span className="text-xs font-semibold text-blue-400">{activeSettings.quality ?? 80}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={activeSettings.quality ?? 80}
                  onChange={(e) => updateSetting({ quality: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-slate-500 leading-normal">
                  Sets initial quality prior to resolution reduction scaling.
                </p>
              </div>
            )}

            {/* Resize Mode */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Dimensions Scaling
              </label>
              <select
                value={activeSettings.resizeMode}
                onChange={(e) => updateSetting({ resizeMode: e.target.value as ResizeMode, resizeValue: undefined })}
                className="w-full px-4 py-2 bg-slate-950/80 border border-slate-700/60 rounded-xl text-white text-xs font-semibold focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="original">Maintain Original Dimensions</option>
                <option value="percentage">Percentage (Scale Down)</option>
                <option value="width">Target Width (Pixels)</option>
                <option value="height">Target Height (Pixels)</option>
                <option value="fitWidth">Max Width Bounds</option>
                <option value="fitHeight">Max Height Bounds</option>
              </select>

              {activeSettings.resizeMode !== 'original' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Resize Value
                  </label>
                  <input
                    type="number"
                    value={activeSettings.resizeValue || ''}
                    placeholder={
                      activeSettings.resizeMode === 'percentage'
                        ? 'e.g. 50 (%)'
                        : activeSettings.resizeMode.includes('Width')
                        ? 'Width (px)'
                        : 'Height (px)'
                    }
                    onChange={(e) => updateSetting({ resizeValue: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700/60 rounded-xl text-white text-xs placeholder-slate-600 focus:border-blue-500 focus:outline-none transition-all"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="maintainAspect"
                      checked={activeSettings.maintainAspectRatio}
                      onChange={(e) => updateSetting({ maintainAspectRatio: e.target.checked })}
                      className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                    />
                    <label htmlFor="maintainAspect" className="text-[11px] text-slate-400 font-medium cursor-pointer">
                      Lock Aspect Ratio
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Background Fill (For JPG background transparency replacement) */}
            {activeSettings.outputFormat === 'jpg' && (
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Background Color (Transparency Replacement)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={activeSettings.backgroundFill}
                    onChange={(e) => updateSetting({ backgroundFill: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-slate-950 border border-slate-700/60 overflow-hidden"
                  />
                  <input
                    type="text"
                    value={activeSettings.backgroundFill}
                    onChange={(e) => updateSetting({ backgroundFill: e.target.value })}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700/60 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Transparencies are painted to this background color during JPEG encoding.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apply to all Toggle (Only visible in global mode) */}
      {editingTarget === 'global' && (
        <div className="flex items-center gap-2.5 pt-2 border-t border-slate-800/80">
          <input
            type="checkbox"
            id="applyAll"
            checked={applyToAll}
            onChange={(e) => setApplyToAll(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-blue-500 focus:ring-blue-500/20 cursor-pointer accent-blue-500"
          />
          <label htmlFor="applyAll" className="text-xs font-semibold text-slate-300 cursor-pointer select-none">
            Cascade these global settings to new uploads
          </label>
        </div>
      )}
    </div>
  )
}
