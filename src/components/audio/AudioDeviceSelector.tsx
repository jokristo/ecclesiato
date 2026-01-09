'use client'

import { useAudio } from '@/contexts/AudioContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function AudioDeviceSelector() {
  const { 
    devices, 
    selectedDeviceId, 
    isLoading, 
    error, 
    enumerateDevices, 
    selectDevice 
  } = useAudio()
  
  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId)
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <MicOff className="h-5 w-5" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Audio Input Device
        </label>
        <Button
          variant="ghost"
          size="sm"
          onClick={enumerateDevices}
          disabled={isLoading}
          className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span className="ml-2 hidden sm:inline">Refresh</span>
        </Button>
      </div>
      
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <Select
          value={selectedDeviceId || ''}
          onValueChange={selectDevice}
          disabled={devices.length === 0}
        >
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              {selectedDeviceId ? (
                <Mic className="h-4 w-4 text-emerald-600" />
              ) : (
                <MicOff className="h-4 w-4 text-slate-400" />
              )}
              <SelectValue placeholder="Select a microphone..." />
            </div>
          </SelectTrigger>
          <SelectContent>
            {devices.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 dark:text-slate-400">
                No audio devices found. Click refresh to scan for devices.
              </div>
            ) : (
              devices.map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4" />
                    <span>{device.label}</span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      )}
      
      {selectedDevice && (
        <div className="text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Device ready: {selectedDevice.label}</span>
          </div>
        </div>
      )}
    </div>
  )
}
