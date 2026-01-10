'use client'

import { useEffect } from 'react'
import { AudioProvider, useAudio } from '@/contexts/AudioContext'
import { AudioDeviceSelector } from '@/components/audio/AudioDeviceSelector'
import { VolumeMeter } from '@/components/audio/VolumeMeter'
import { AudioRecorder } from '@/components/audio/AudioRecorder'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mic, Volume2, Radio, FileAudio, Settings } from 'lucide-react'

function DashboardContent() {
  const { enumerateDevices, clearError } = useAudio()
  
  useEffect(() => {
    // Enumerate devices on mount
    enumerateDevices()
  }, [enumerateDevices])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                <Radio className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  K-VOICE
                </h1>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Sermon Capture & AI Processing
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Console */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-700">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50">
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Audio Console
                </CardTitle>
                <CardDescription>
                  Configure audio input and monitor levels in real-time
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                {/* Device Selector */}
                <AudioDeviceSelector />
                
                {/* Volume Meter */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <VolumeMeter />
                </div>
              </CardContent>
            </Card>
            
            {/* Recording Controls */}
            <AudioRecorder />
          </div>
          
          {/* Right Column - Status & Info */}
          <div className="space-y-6">
            {/* System Status */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileAudio className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatusItem
                  label="Audio Engine"
                  status="ready"
                  description="Web Audio API initialized"
                />
                <StatusItem
                  label="AI Processing"
                  status="ready"
                  description="Transcription service available"
                />
                <StatusItem
                  label="Storage"
                  status="ready"
                  description="Ready to receive recordings"
                />
              </CardContent>
            </Card>
            
            {/* Quick Guide */}
            <Card className="shadow-sm border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="text-lg">Quick Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <span className="pt-0.5">Select your microphone from the dropdown</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <span className="pt-0.5">Monitor levels to ensure no clipping</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <span className="pt-0.5">Start recording the sermon</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                      4
                    </span>
                    <span className="pt-0.5">Upload for AI transcription</span>
                  </li>
                </ol>
              </CardContent>
            </Card>
            
            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="text-lg text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">•</span>
                    <span>Keep input levels between -20dB and -6dB for optimal quality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">•</span>
                    <span>Use a USB microphone or direct line-in for best results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400">•</span>
                    <span>Disable noise cancellation in your OS settings if possible</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              © 2026 K-VOICE. All rights reserved.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Powered by Kristo agency
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

interface StatusItemProps {
  label: string
  status: 'ready' | 'busy' | 'error'
  description: string
}

function StatusItem({ label, status, description }: StatusItemProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'ready':
        return 'bg-emerald-500'
      case 'busy':
        return 'bg-amber-500'
      case 'error':
        return 'bg-red-500'
    }
  }
  
  const getStatusText = () => {
    switch (status) {
      case 'ready':
        return 'Ready'
      case 'busy':
        return 'Busy'
      case 'error':
        return 'Error'
    }
  }
  
  return (
    <div className="flex items-start gap-3">
      <div className={`h-2 w-2 rounded-full ${getStatusColor()} mt-2 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {label}
          </span>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            {getStatusText()}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">
          {description}
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <AudioProvider>
      <DashboardContent />
    </AudioProvider>
  )
}
