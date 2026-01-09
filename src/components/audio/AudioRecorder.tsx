'use client'

import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Play, Square, Trash2, Clock, Upload, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'

export function AudioRecorder() {
  const {
    isRecording,
    recordingDuration,
    recordings,
    isLoading,
    error,
    selectedDeviceId,
    startRecording,
    stopRecording,
    deleteRecording,
    discardRecording,
    playRecording,
    stopPlayback
  } = useAudio()
  
  const handleStartRecording = async () => {
    await startRecording()
  }
  
  const handleStopRecording = async () => {
    await stopRecording()
  }
  
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recording?')) {
      deleteRecording(id)
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recording Controls</CardTitle>
          <CardDescription>
            Start or stop audio recording for sermon capture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          
          {/* Device Status */}
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className={cn(
              'h-2 w-2 rounded-full',
              selectedDeviceId ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            )} />
            <span>
              {selectedDeviceId ? 'Microphone connected' : 'No microphone selected'}
            </span>
          </div>
          
          {/* Recording Status */}
          {isRecording && (
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                <div>
                  <div className="text-sm font-medium text-red-700">Recording in Progress</div>
                  <div className="text-xs text-red-600">Audio is being captured</div>
                </div>
              </div>
              <Badge variant="outline" className="font-mono text-red-700 border-red-300">
                {formatDuration(recordingDuration)}
              </Badge>
            </div>
          )}
          
          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button
                onClick={handleStartRecording}
                disabled={isLoading || !selectedDeviceId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={handleStopRecording}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2 fill-current" />
                Stop Recording
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Recordings List */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recordings</CardTitle>
            <CardDescription>
              {recordings.length} recording{recordings.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {recordings.map(recording => (
                  <RecordingItem
                    key={recording.id}
                    recording={recording}
                    onPlay={() => playRecording(recording.id)}
                    onDelete={() => handleDelete(recording.id)}
                    onDiscard={() => discardRecording(recording.id)}
                  />
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Empty State */}
      {recordings.length === 0 && !isRecording && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No recordings yet
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Start recording a sermon to begin the AI transcription and processing workflow.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface RecordingItemProps {
  recording: {
    id: string
    timestamp: Date
    duration: number
    url: string
  }
  onPlay: () => void
  onDelete: () => void
  onDiscard: () => void
}

function RecordingItem({ recording, onPlay, onDelete, onDiscard }: RecordingItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  
  const handlePlay = () => {
    setIsPlaying(true)
    onPlay()
    // Simulate playback end
    setTimeout(() => setIsPlaying(false), recording.duration)
  }
  
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {recording.timestamp.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Duration: {formatDuration(recording.duration)}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePlay}
            className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <Play className={cn('h-4 w-4', isPlaying && 'animate-pulse')} />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onDelete}
            className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Audio Preview */}
      <audio
        src={recording.url}
        controls
        className="w-full h-8"
        preload="metadata"
      />
      
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onDiscard}
          className="flex-1 text-xs"
        >
          Discard
        </Button>
        <Button
          size="sm"
          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700"
          disabled
        >
          Upload & Transcribe
        </Button>
      </div>
    </div>
  )
}
