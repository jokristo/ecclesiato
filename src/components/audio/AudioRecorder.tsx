'use client'

import { useAudio } from '@/contexts/AudioContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Play, Square, Trash2, Clock, Upload, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration } from '@/lib/utils'
import { useState } from 'react'
import { SermonOutput } from '@/components/audio/SermonOutput'

// ---------------------------------------------------------------------------
// Per-recording upload state
// ---------------------------------------------------------------------------

type UploadStatus = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

interface UploadState {
  status: UploadStatus
  progress: number
  sermonId: string | null
  error: string | null
}

// ---------------------------------------------------------------------------
// AudioRecorder
// ---------------------------------------------------------------------------

interface AudioRecorderProps {
  /** Préremplit le dialogue d’upload (page Enregistrer) */
  uploadFormDefaults?: Partial<{ title: string; speaker: string; date: string }>
}

export function AudioRecorder({ uploadFormDefaults }: AudioRecorderProps = {}) {
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
  } = useAudio()

  // Upload states keyed by recording id
  const [uploadStates, setUploadStates] = useState<Record<string, UploadState>>({})

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingRecordingId, setPendingRecordingId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', speaker: '', date: new Date().toISOString().split('T')[0] })
  const [formError, setFormError] = useState('')

  const setUpload = (id: string, patch: Partial<UploadState>) =>
    setUploadStates(prev => ({ ...prev, [id]: { ...defaultUploadState, ...prev[id], ...patch } }))

  const defaultUploadState: UploadState = { status: 'idle', progress: 0, sermonId: null, error: null }
  const getUpload = (id: string): UploadState => uploadStates[id] ?? defaultUploadState

  // Open dialog to collect sermon metadata before uploading
  const openUploadDialog = (recordingId: string) => {
    setPendingRecordingId(recordingId)
    const d = new Date().toISOString().split('T')[0]
    setForm({
      title: uploadFormDefaults?.title ?? '',
      speaker: uploadFormDefaults?.speaker ?? '',
      date: uploadFormDefaults?.date ?? d,
    })
    setFormError('')
    setDialogOpen(true)
  }

  const handleUploadConfirm = async () => {
    if (!pendingRecordingId) return
    if (!form.title.trim() || !form.speaker.trim() || !form.date) {
      setFormError('Tous les champs sont obligatoires.')
      return
    }

    const recording = recordings.find(r => r.id === pendingRecordingId)
    if (!recording) return

    setDialogOpen(false)
    await uploadAndTranscribe(pendingRecordingId, recording.blob, form)
  }

  const uploadAndTranscribe = async (
    recordingId: string,
    blob: Blob,
    metadata: { title: string; speaker: string; date: string },
  ) => {
    setUpload(recordingId, { status: 'uploading', progress: 0, error: null })

    try {
      // Build multipart form
      const formData = new FormData()
      formData.append('title', metadata.title)
      formData.append('speaker', metadata.speaker)
      formData.append('date', metadata.date)
      formData.append('audio', blob, `recording-${recordingId}.webm`)

      // Simulate progress during upload (XHR not available in fetch, so we pulse)
      const progressInterval = setInterval(() => {
        setUploadStates(prev => {
          const cur = prev[recordingId]?.progress ?? 0
          if (cur >= 85) return prev
          return { ...prev, [recordingId]: { ...prev[recordingId], progress: cur + 5 } }
        })
      }, 300)

      const res = await fetch('/api/sermons', { method: 'POST', body: formData })
      clearInterval(progressInterval)

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `Erreur ${res.status}`)
      }

      const { sermon } = await res.json()
      setUpload(recordingId, { status: 'processing', progress: 100, sermonId: sermon.id, error: null })

      // Trigger transcription + NLP
      await fetch(`/api/sermons/${sermon.id}/process`, { method: 'POST' })

      setUpload(recordingId, { status: 'done', progress: 100, sermonId: sermon.id, error: null })
    } catch (err: any) {
      setUpload(recordingId, { status: 'error', progress: 0, sermonId: null, error: err.message ?? 'Erreur inconnue' })
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet enregistrement ?')) {
      deleteRecording(id)
      setUploadStates(prev => { const n = { ...prev }; delete n[id]; return n })
    }
  }

  return (
    <div className="space-y-4">

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recording Controls</CardTitle>
          <CardDescription>Start or stop audio recording for sermon capture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <div className={cn('h-2 w-2 rounded-full', selectedDeviceId ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600')} />
            <span>{selectedDeviceId ? 'Microphone connected' : 'No microphone selected'}</span>
          </div>

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

          <div className="flex items-center gap-3">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                disabled={isLoading || !selectedDeviceId}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                size="lg"
              >
                <Square className="h-5 w-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={stopRecording}
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
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {recordings.map(recording => (
                  <RecordingItem
                    key={recording.id}
                    recording={recording}
                    uploadState={getUpload(recording.id)}
                    onPlay={() => playRecording(recording.id)}
                    onDelete={() => handleDelete(recording.id)}
                    onDiscard={() => discardRecording(recording.id)}
                    onUpload={() => openUploadDialog(recording.id)}
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
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">No recordings yet</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Start recording a sermon to begin the AI transcription and processing workflow.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Upload metadata dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informations du sermon</DialogTitle>
            <DialogDescription>
              Ces informations seront associées à l'enregistrement avant l'envoi au backend.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sermon-title">Titre *</Label>
              <Input
                id="sermon-title"
                placeholder="ex. La grâce de Dieu"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sermon-speaker">Prédicateur *</Label>
              <Input
                id="sermon-speaker"
                placeholder="ex. Pasteur Jean Dupont"
                value={form.speaker}
                onChange={e => setForm(f => ({ ...f, speaker: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sermon-date">Date *</Label>
              <Input
                id="sermon-date"
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleUploadConfirm}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Uploader & Transcrire
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ---------------------------------------------------------------------------
// RecordingItem
// ---------------------------------------------------------------------------

interface RecordingItemProps {
  recording: { id: string; timestamp: Date; duration: number; url: string }
  uploadState: UploadState
  onPlay: () => void
  onDelete: () => void
  onDiscard: () => void
  onUpload: () => void
}

function RecordingItem({ recording, uploadState, onPlay, onDelete, onDiscard, onUpload }: RecordingItemProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const { status, progress, sermonId, error } = uploadState

  const handlePlay = () => {
    setIsPlaying(true)
    onPlay()
    setTimeout(() => setIsPlaying(false), recording.duration)
  }

  const isUploading = status === 'uploading'
  const isProcessing = status === 'processing'
  const isDone = status === 'done'
  const isError = status === 'error'
  const isBusy = isUploading || isProcessing

  return (
    <div className="space-y-3">
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {recording.timestamp.toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Durée : {formatDuration(recording.duration)}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handlePlay} disabled={isBusy}
              className="text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400">
              <Play className={cn('h-4 w-4', isPlaying && 'animate-pulse')} />
            </Button>
            <Button size="sm" variant="ghost" onClick={onDelete} disabled={isBusy}
              className="text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Audio preview */}
        <audio src={recording.url} controls className="w-full h-8" preload="metadata" />

        {/* Upload progress bar */}
        {isUploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Upload en cours…</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        {/* Processing badge */}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Transcription en cours…</span>
          </div>
        )}

        {/* Success badge */}
        {isDone && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Envoyé — traitement en cours ci-dessous</span>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Action buttons */}
        {status === 'idle' && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onDiscard} className="flex-1 text-xs">
              Supprimer
            </Button>
            <Button
              size="sm"
              onClick={onUpload}
              className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload & Transcrire
            </Button>
          </div>
        )}

        {isError && (
          <Button size="sm" variant="outline" onClick={onUpload} className="w-full text-xs">
            Réessayer
          </Button>
        )}
      </div>

      {/* SermonOutput — shown once the sermon has been created */}
      {(isProcessing || isDone) && sermonId && (
        <SermonOutput sermonId={sermonId} />
      )}
    </div>
  )
}
