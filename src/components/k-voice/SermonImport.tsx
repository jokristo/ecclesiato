'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Upload, FileAudio, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useUploadLimits } from '@/hooks/use-upload-limits'
import { formatFileSize, validateAudioFileSize } from '@/lib/uploadLimits'

type OrgOption = { id: string; name: string }

interface SermonImportProps {
  uploadFormDefaults?: Partial<{ title: string; speaker: string; date: string }>
}

export function SermonImport({ uploadFormDefaults }: SermonImportProps) {
  const router = useRouter()
  const { isSuperAdmin } = useAuth()
  const { limits } = useUploadLimits()
  const fileRef = useRef<HTMLInputElement>(null)

  const compressTarget = limits.audioCompressionTargetMb ?? 24
  const willAutoCompress = limits.audioCompressionEnabled

  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState(uploadFormDefaults?.title ?? '')
  const [speaker, setSpeaker] = useState(uploadFormDefaults?.speaker ?? '')
  const [date, setDate] = useState(
    uploadFormDefaults?.date ?? new Date().toISOString().split('T')[0],
  )
  const [description, setDescription] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [organizations, setOrganizations] = useState<OrgOption[]>([])
  const [orgsLoaded, setOrgsLoaded] = useState(false)
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [sermonId, setSermonId] = useState<string | null>(null)
  const [willCompress, setWillCompress] = useState(false)

  const loadOrgs = async () => {
    if (!isSuperAdmin || orgsLoaded) return
    try {
      const res = await fetch('/api/organizations')
      const data = await res.json()
      if (res.ok && data.organizations?.length) {
        setOrganizations(data.organizations)
        if (!organizationId) setOrganizationId(data.organizations[0].id)
      }
    } finally {
      setOrgsLoaded(true)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    setError('')
    if (f) {
      const check = validateAudioFileSize(f, limits)
      if (!check.ok) {
        setError(check.message)
        setWillCompress(false)
      } else {
        setWillCompress(Boolean(check.willCompress))
      }
    } else {
      setWillCompress(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Choisissez un fichier audio.')
      return
    }
    const sizeCheck = validateAudioFileSize(file, limits)
    if (!sizeCheck.ok) {
      setError(sizeCheck.message)
      return
    }
    if (!title.trim() || !speaker.trim() || !date) {
      setError('Titre, prédicateur et date sont obligatoires.')
      return
    }
    if (isSuperAdmin) await loadOrgs()

    setStatus('uploading')
    setProgress(10)
    setError('')

    const formData = new FormData()
    formData.append('title', title.trim())
    formData.append('speaker', speaker.trim())
    formData.append('date', date)
    if (description.trim()) formData.append('description', description.trim())
    if (isSuperAdmin && organizationId) formData.append('organizationId', organizationId)
    formData.append('audio', file, file.name)

    const tick = setInterval(() => {
      setProgress((p) => (p >= 85 ? p : p + 8))
    }, 400)

    try {
      const res = await fetch('/api/sermons', { method: 'POST', body: formData })
      clearInterval(tick)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? `Erreur ${res.status}`)
      }
      setProgress(100)
      setSermonId(data.sermon?.id ?? null)
      setStatus('processing')
      setTimeout(() => {
        setStatus('done')
        if (data.sermon?.id) router.push(`/sermon/${data.sermon.id}`)
      }, 800)
    } catch (err) {
      clearInterval(tick)
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setProgress(0)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-indigo-600" />
          Importer une prédication existante
        </CardTitle>
        <CardDescription className="space-y-1">
          <span className="block">
            Fichier audio (MP3, M4A, WAV, WebM…). Transcription et résumé automatiques.
          </span>
          <span className="flex items-start gap-1.5 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Upload jusqu&apos;à {limits.maxUploadSizeMb} Mo.
            {willAutoCompress &&
              ` Les gros fichiers sont convertis en MP3 optimisé ; si nécessaire, découpage automatique à la transcription (Whisper ≤ ${compressTarget} Mo par partie).`}
            {limits.audioRetentionEnabled !== false && limits.audioRetentionDays != null && (
              <>
                {' '}
                L&apos;audio est conservé {limits.audioRetentionDays} jour
                {limits.audioRetentionDays > 1 ? 's' : ''} sur le serveur (la transcription reste
                en base).
              </>
            )}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-audio">Fichier audio</Label>
            <div
              className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 px-6 py-10 transition-colors hover:border-indigo-300 hover:bg-indigo-50/30"
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <input
                ref={fileRef}
                id="import-audio"
                type="file"
                accept="audio/*,.mp3,.m4a,.wav,.webm,.ogg,.flac,.aac"
                className="hidden"
                onChange={handleFileChange}
              />
              <FileAudio className="mb-2 h-10 w-10 text-indigo-500" />
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{formatFileSize(file.size)}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Cliquez pour choisir un fichier (max {limits.maxUploadSizeMb} Mo)
                </p>
              )}
              {file && willCompress && (
                <p className="mt-2 text-xs font-medium text-indigo-600">
                  Sera compressé automatiquement avant transcription
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="import-title">Titre</Label>
              <Input
                id="import-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. : La foi en action"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="import-speaker">Prédicateur</Label>
              <Input
                id="import-speaker"
                value={speaker}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Nom du prédicateur"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="import-date">Date de la prédication</Label>
              <Input
                id="import-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Organisation</Label>
                <Select
                  value={organizationId}
                  onValueChange={setOrganizationId}
                  onOpenChange={(open) => open && void loadOrgs()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une église" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="import-desc">Description (optionnel)</Label>
            <Textarea
              id="import-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Notes, série, occasion…"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {(status === 'uploading' || status === 'processing') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {status === 'uploading' ? 'Envoi du fichier…' : 'Transcription et analyse en cours…'}
              </div>
              <Progress value={progress} />
            </div>
          )}

          {status === 'done' && sermonId && (
            <div className="flex items-center gap-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Prédication importée.{' '}
              <Link href={`/sermon/${sermonId}`} className="font-medium underline">
                Voir le détail
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-600/90"
            disabled={status === 'uploading' || status === 'processing'}
          >
            {status === 'uploading' || status === 'processing' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement…
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer et analyser
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
