'use client'

import { useAudio } from '@/contexts/AudioContext'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VolumeMeterProps {
  className?: string
}

export function VolumeMeter({ className }: VolumeMeterProps) {
  const { volume, isRecording } = useAudio()
  const { level, peak, clipped } = volume
  
  // Determine color based on level
  const getColorClass = (lvl: number) => {
    if (lvl >= 95) return 'bg-red-500' // Clipping
    if (lvl >= 80) return 'bg-amber-500' // Warning
    return 'bg-emerald-500' // Good
  }
  
  const getPeakColorClass = (peak: number) => {
    if (peak >= 95) return 'bg-red-500'
    if (peak >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }
  
  // Convert level to decibels (approximate)
  const getDecibelDisplay = (lvl: number) => {
    if (lvl === 0) return '-∞ dB'
    const db = Math.round(20 * Math.log10(lvl / 100))
    return `${db} dB`
  }
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Input Level
          </span>
        </div>
        <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
          {getDecibelDisplay(level)}
        </span>
      </div>
      
      {/* Volume Meter Bar */}
      <div className="relative">
        {/* Track */}
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          {/* Peak Indicator */}
          <div
            className={cn(
              'absolute top-0 bottom-0 transition-all duration-100',
              getPeakColorClass(peak),
              'opacity-30'
            )}
            style={{ width: `${peak}%` }}
          />
          
          {/* Current Level */}
          <div
            className={cn(
              'absolute top-0 bottom-0 transition-all duration-75',
              getColorClass(level),
              clipped && 'animate-pulse'
            )}
            style={{ width: `${level}%` }}
          />
        </div>
        
        {/* dB Markers */}
        <div className="absolute top-5 left-0 right-0 flex justify-between text-xs text-slate-400 dark:text-slate-600">
          <span>-∞</span>
          <span>-20</span>
          <span>-10</span>
          <span>-6</span>
          <span>0</span>
        </div>
      </div>
      
      {/* Clipping Warning */}
      {clipped && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Clipping detected! Reduce input volume to prevent audio distortion.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Status Indicators */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            level > 0 ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
          )} />
          <span className="text-slate-600 dark:text-slate-400">
            Signal {level > 0 ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <div className={cn(
            'h-2 w-2 rounded-full',
            clipped ? 'bg-red-500' : 'bg-emerald-500'
          )} />
          <span className="text-slate-600 dark:text-slate-400">
            {clipped ? 'Clipping' : 'Good Quality'}
          </span>
        </div>
      </div>
      
      {/* Recording Status */}
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            Recording...
          </span>
        </div>
      )}
    </div>
  )
}

// Compact version for smaller displays
export function VolumeMeterCompact({ className }: VolumeMeterProps) {
  const { volume } = useAudio()
  const { level, clipped } = volume
  
  const getColorClass = (lvl: number) => {
    if (lvl >= 95) return 'bg-red-500'
    if (lvl >= 80) return 'bg-amber-500'
    return 'bg-emerald-500'
  }
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-shrink-0">
        <Volume2 className="h-4 w-4 text-slate-600 dark:text-slate-400" />
      </div>
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-75',
            getColorClass(level),
            clipped && 'animate-pulse'
          )}
          style={{ width: `${level}%` }}
        />
      </div>
      <span className="flex-shrink-0 text-xs font-mono text-slate-600 dark:text-slate-400 w-12 text-right">
        {Math.round(level)}%
      </span>
    </div>
  )
}
