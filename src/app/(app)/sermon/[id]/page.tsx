'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from '@/components/k-voice/StatusBadge'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  FileText,
  Lightbulb,
  Download,
  Share2,
  Loader2,
  XCircle,
  Trash2,
  BookOpen,
  Quote,
  Sparkles,
  Languages,
  CheckCircle2,
  AlertCircle,
  Copy,
  LayoutGrid,
  ScrollText,
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { normalizeSermonStatus } from '@/lib/sermonDisplay'
import { cn } from '@/lib/utils'

type NlpCorrection = {
  original: string
  corrected: string
  note?: string
}

type NlpMetadata = {
  centralMessage?: string
  correctedTranscript?: string
  corrections?: NlpCorrection[]
  confidence?: 'high' | 'medium' | 'low'
  pipeline?: string
}

type SermonOutput = {
  transcript?: string | null
  summary?: string | null
  keyPoints?: string[]
  mainThemes?: string[]
  keyVerses?: { reference: string }[]
  references?: string[]
  wordCount?: number
  estimatedReadTime?: number
  aiModel?: string | null
  nlpMetadata?: NlpMetadata | null
}

type SermonDetail = {
  id: string
  title: string
  speaker: string
  date: string
  status: string
  audioDuration?: number | null
  output?: SermonOutput | null
}

function ConfidenceBadge({ level }: { level?: string }) {
  const config = {
    high: {
      label: 'Transcription fiable',
      className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: CheckCircle2,
    },
    medium: {
      label: 'Transcription correcte',
      className: 'border-amber-200 bg-amber-50 text-amber-800',
      icon: AlertCircle,
    },
    low: {
      label: 'Vérification conseillée',
      className: 'border-orange-200 bg-orange-50 text-orange-800',
      icon: AlertCircle,
    },
  } as const

  const key = (level === 'high' || level === 'medium' || level === 'low' ? level : 'medium') as keyof typeof config
  const { label, className, icon: Icon } = config[key]

  return (
    <Badge variant="outline" className={cn('gap-1.5 px-2.5 py-1 text-xs font-medium', className)}>
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Badge>
  )
}

function TranscriptBlock({ text }: { text: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean)
  return (
    <div className="prose prose-slate max-w-none text-[15px] leading-relaxed text-slate-700">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="mb-4 last:mb-0">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function buildExportMarkdown(sermon: SermonDetail, output: SermonOutput | null | undefined) {
  const meta = output?.nlpMetadata
  const lines = [
    `# ${sermon.title}`,
    '',
    `**Prédicateur :** ${sermon.speaker}`,
    `**Date :** ${new Date(sermon.date).toLocaleDateString('fr-FR')}`,
    '',
  ]
  if (meta?.centralMessage) {
    lines.push('## Message central', '', meta.centralMessage, '')
  }
  if (output?.summary) {
    lines.push('## Résumé pastoral', '', output.summary, '')
  }
  if (output?.keyPoints?.length) {
    lines.push('## Points clés', '', ...output.keyPoints.map((p, i) => `${i + 1}. ${p}`), '')
  }
  if (output?.keyVerses?.length) {
    lines.push('## Versets cités', '', ...output.keyVerses.map((v) => `- ${v.reference}`), '')
  }
  const transcript = meta?.correctedTranscript || output?.transcript
  if (transcript) {
    lines.push('## Transcription', '', transcript)
  }
  return lines.join('\n')
}

export default function SermonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [sermon, setSermon] = useState<SermonDetail | null>(undefined)
  const [error, setError] = useState<string | null>(null)
  const [actionBusy, setActionBusy] = useState<'cancel' | 'delete' | null>(null)
  const [transcriptView, setTranscriptView] = useState<'corrected' | 'raw'>('corrected')
  const [copied, setCopied] = useState<string | null>(null)

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      alert('Copie impossible')
    }
  }

  const handleExport = () => {
    if (!sermon) return
    const md = buildExportMarkdown(sermon, sermon.output)
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${sermon.title.replace(/[^\w\s-]/g, '').trim() || 'predication'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/sermons/${id}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Prédication introuvable')
      }
      setSermon(data.sermon)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur')
      setSermon(null)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!sermon) return
    const s = normalizeSermonStatus(sermon.status)
    if (s !== 'transcribing' && s !== 'processing') return
    const interval = setInterval(() => void load(), 3000)
    return () => clearInterval(interval)
  }, [sermon, load])

  const handleCancel = async () => {
    setActionBusy('cancel')
    try {
      const res = await fetch(`/api/sermons/${id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Annulation impossible')
      }
      await load()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setActionBusy(null)
    }
  }

  const handleDelete = async () => {
    setActionBusy('delete')
    try {
      const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Suppression impossible')
      }
      router.push('/')
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
      setActionBusy(null)
    }
  }

  if (sermon === undefined) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Chargement…
      </div>
    )
  }

  if (error || !sermon) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Prédication non trouvée</h2>
        <p className="mt-2 text-slate-600">{error}</p>
        <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-600/90">
          <Link href="/">Retour au dashboard</Link>
        </Button>
      </div>
    )
  }

  const status = normalizeSermonStatus(sermon.status)
  const output = sermon.output
  const meta = output?.nlpMetadata
  const centralMessage = meta?.centralMessage
  const correctedTranscript = meta?.correctedTranscript
  const rawTranscript = output?.transcript
  const hasCorrected = Boolean(correctedTranscript?.trim())
  const displayTranscript =
    transcriptView === 'corrected' && hasCorrected ? correctedTranscript! : rawTranscript ?? ''
  const corrections = meta?.corrections?.filter((c) => c.original || c.corrected) ?? []
  const keyPoints = output?.keyPoints ?? []
  const themes = output?.mainThemes ?? []
  const keyVerses = output?.keyVerses ?? []
  const references = output?.references ?? []
  const summary = output?.summary

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    })
  }

  const durationLabel =
    sermon.audioDuration != null && sermon.audioDuration >= 0
      ? `${Math.floor(sermon.audioDuration / 60)}:${Math.floor(sermon.audioDuration % 60)
          .toString()
          .padStart(2, '0')}`
      : '—'

  const readTimeMin =
    output?.estimatedReadTime != null && output.estimatedReadTime > 0
      ? Math.max(1, Math.round(output.estimatedReadTime / 60))
      : null

  const hasContent =
    status === 'completed' || status === 'processing' || status === 'transcribing'

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-4">
          <Button variant="ghost" className="-ml-2 h-9 px-2 text-slate-600" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au dashboard
            </Link>
          </Button>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={status} />
              {meta?.pipeline === '2-step' && status === 'completed' && (
                <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                  <Sparkles className="h-3 w-3" />
                  Pipeline 2 étapes
                </Badge>
              )}
              {meta?.confidence && status === 'completed' && (
                <ConfidenceBadge level={meta.confidence} />
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {sermon.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:shrink-0">
          {(status === 'transcribing' || status === 'processing') && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-amber-700"
                  disabled={actionBusy !== null}
                >
                  {actionBusy === 'cancel' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Annuler
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la transcription ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le traitement en cours sera interrompu. La prédication repassera en attente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Non</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Oui, annuler</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Button variant="outline" size="sm" className="gap-2" type="button">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
          <Button variant="outline" size="sm" className="gap-2" type="button" onClick={handleExport}>
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 hover:text-red-700"
                disabled={actionBusy !== null}
              >
                {actionBusy === 'delete' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette prédication ?</AlertDialogTitle>
                <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Meta bar */}
      <Card className="overflow-hidden border-slate-200/80 shadow-sm">
        <CardContent className="p-0">
          <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <User className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Prédicateur
                </p>
                <p className="font-semibold text-slate-900">{sermon.speaker}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                <Calendar className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Date</p>
                <p className="font-semibold text-slate-900">{formatDate(sermon.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
                <Clock className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Durée</p>
                <p className="font-semibold text-slate-900">
                  {durationLabel}
                  {readTimeMin != null && (
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      · ~{readTimeMin} min de lecture
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status alerts */}
      {status === 'failed' && (
        <Alert variant="destructive">
          <AlertTitle>Échec du traitement</AlertTitle>
          <AlertDescription>
            Une erreur s&apos;est produite durant la transcription ou le résumé. Réessayez depuis
            l&apos;enregistrement ou contactez le support.
          </AlertDescription>
        </Alert>
      )}
      {status === 'pending' && (
        <Alert>
          <AlertTitle>En attente de traitement</AlertTitle>
          <AlertDescription>
            Cette prédication est en attente. La transcription démarrera bientôt.
          </AlertDescription>
        </Alert>
      )}
      {status === 'transcribing' && (
        <Alert className="border-indigo-200 bg-indigo-50/50">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <AlertTitle>Transcription en cours</AlertTitle>
          <AlertDescription>
            L&apos;audio est en cours de transcription (Whisper). Cela peut prendre quelques
            minutes.
          </AlertDescription>
        </Alert>
      )}
      {status === 'processing' && (
        <Alert className="border-violet-200 bg-violet-50/50">
          <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
          <AlertTitle>Analyse en 2 étapes</AlertTitle>
          <AlertDescription>
            Normalisation du texte, puis génération du résumé pastoral fidèle au message.
          </AlertDescription>
        </Alert>
      )}

      {/* Central message hero */}
      {centralMessage && status === 'completed' && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 px-8 py-10 text-white shadow-lg">
          <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-indigo-200">
                <Quote className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium uppercase tracking-wider">Message central</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 text-indigo-100 hover:bg-white/10 hover:text-white"
                onClick={() => void copyText('central', centralMessage)}
              >
                {copied === 'central' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied === 'central' ? 'Copié' : 'Copier'}
              </Button>
            </div>
            <p className="text-xl font-semibold leading-snug sm:text-2xl">{centralMessage}</p>
          </div>
        </div>
      )}

      {hasContent && (
        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main content tabs */}
          <Tabs defaultValue={status === 'completed' ? 'overview' : 'summary'} className="w-full">
            <TabsList className="mb-2 grid h-auto w-full grid-cols-2 gap-1 bg-slate-100 p-1 sm:grid-cols-5">
              {status === 'completed' && (
                <TabsTrigger value="overview" className="gap-1.5 py-2.5 data-[state=active]:shadow-sm">
                  <LayoutGrid className="h-4 w-4" />
                  Vue d&apos;ensemble
                </TabsTrigger>
              )}
              <TabsTrigger value="summary" className="gap-1.5 py-2.5 data-[state=active]:shadow-sm">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Résumé</span>
                <span className="sm:hidden">Résumé</span>
              </TabsTrigger>
              <TabsTrigger value="keypoints" className="gap-1.5 py-2.5 data-[state=active]:shadow-sm">
                <Lightbulb className="h-4 w-4" />
                Points clés
              </TabsTrigger>
              <TabsTrigger value="bible" className="gap-1.5 py-2.5 data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" />
                Bible
              </TabsTrigger>
              <TabsTrigger
                value="transcription"
                className="gap-1.5 py-2.5 data-[state=active]:shadow-sm"
              >
                <ScrollText className="h-4 w-4" />
                Texte
              </TabsTrigger>
            </TabsList>

            {status === 'completed' && (
              <TabsContent value="overview" className="mt-4 space-y-4">
                {summary && (
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        Résumé pastoral
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={() => void copyText('summary', summary)}
                      >
                        {copied === 'summary' ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                        {copied === 'summary' ? 'Copié' : 'Copier'}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
                        {summary.split(/\n\n+/).map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {keyPoints.length > 0 && (
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Lightbulb className="h-5 w-5 text-amber-500" />
                        Points clés ({keyPoints.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {keyPoints.map((point, index) => (
                          <li
                            key={index}
                            className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                          >
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                              {index + 1}
                            </span>
                            <p className="text-sm leading-relaxed text-slate-700">{point}</p>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {(keyVerses.length > 0 || references.length > 0 || themes.length > 0) && (
                  <Card className="border-slate-200/80 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <BookOpen className="h-5 w-5 text-emerald-600" />
                        Bible & thèmes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {themes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {themes.map((theme, i) => (
                            <Badge
                              key={i}
                              className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
                            >
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {keyVerses.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {keyVerses.map((v, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                            >
                              {v.reference}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {references.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {references.map((ref, i) => (
                            <Badge key={i} variant="secondary" className="font-normal">
                              {ref}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}

            <TabsContent value="summary" className="mt-4 space-y-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-indigo-600" />
                    Résumé pastoral
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {summary ? (
                    <div className="space-y-4 text-[15px] leading-relaxed text-slate-700">
                      {summary.split(/\n\n+/).map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="flex items-center gap-2 italic text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Le résumé est en cours de génération…
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keypoints" className="mt-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Points clés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {keyPoints.length > 0 ? (
                    <ul className="space-y-4">
                      {keyPoints.map((point, index) => (
                        <li key={index} className="flex gap-4">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
                            {index + 1}
                          </span>
                          <p className="pt-1 leading-relaxed text-slate-700">{point}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="flex items-center gap-2 italic text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Les points clés sont en cours de génération…
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bible" className="mt-4 space-y-4">
              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Versets cités
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {keyVerses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {keyVerses.map((v, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800"
                        >
                          {v.reference}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Aucun verset explicitement cité dans cette prédication.
                    </p>
                  )}
                </CardContent>
              </Card>

              {references.length > 0 && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-slate-700">
                      Références bibliques mentionnées
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="flex flex-wrap gap-2">
                      {references.map((ref, i) => (
                        <li key={i}>
                          <Badge variant="secondary" className="font-normal">
                            {ref}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="transcription" className="mt-4 space-y-4">
              {hasCorrected && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-600">Afficher :</span>
                  <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setTranscriptView('corrected')}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        transcriptView === 'corrected'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Texte corrigé
                    </button>
                    <button
                      type="button"
                      onClick={() => setTranscriptView('raw')}
                      className={cn(
                        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                        transcriptView === 'raw'
                          ? 'bg-white text-indigo-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      )}
                    >
                      Transcription brute
                    </button>
                  </div>
                  {transcriptView === 'corrected' && (
                    <Badge variant="outline" className="gap-1 border-indigo-200 text-indigo-700">
                      <Languages className="h-3 w-3" />
                      FR + Lingala préservé
                    </Badge>
                  )}
                </div>
              )}

              <Card className="border-slate-200/80 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <ScrollText className="h-5 w-5 text-slate-600" />
                    {transcriptView === 'corrected' && hasCorrected
                      ? 'Transcription corrigée'
                      : 'Transcription complète'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {displayTranscript ? (
                    <TranscriptBlock text={displayTranscript} />
                  ) : (
                    <p className="flex items-center gap-2 italic text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      La transcription est en cours…
                    </p>
                  )}
                </CardContent>
              </Card>

              {corrections.length > 0 && transcriptView === 'corrected' && (
                <Card className="border-amber-100 bg-amber-50/30 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-amber-900">
                      Corrections apportées ({corrections.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {corrections.map((c, i) => (
                        <li
                          key={i}
                          className="rounded-lg border border-amber-100 bg-white px-4 py-3 text-sm"
                        >
                          <div className="flex flex-wrap items-baseline gap-2">
                            <span className="text-slate-500 line-through">{c.original}</span>
                            <span className="text-slate-400">→</span>
                            <span className="font-medium text-slate-900">{c.corrected}</span>
                          </div>
                          {c.note && <p className="mt-1 text-xs text-slate-500">{c.note}</p>}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Sidebar — themes & meta */}
          {(status === 'completed' || status === 'processing') && (
            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              {status === 'processing' && (
                <Card className="border-violet-200/80 bg-violet-50/30 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-violet-900">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Pipeline 2 étapes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-violet-800">
                    <p>1. Normalisation du texte (FR + lingala)</p>
                    <p>2. Résumé pastoral fidèle</p>
                  </CardContent>
                </Card>
              )}

              {themes.length > 0 && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Thèmes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    {themes.map((theme, i) => (
                      <Badge
                        key={i}
                        className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
                      >
                        {theme}
                      </Badge>
                    ))}
                  </CardContent>
                </Card>
              )}

              {(output?.wordCount != null && output.wordCount > 0) && (
                <Card className="border-slate-200/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                      Statistiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Mots</span>
                      <span className="font-medium text-slate-900">
                        {output.wordCount.toLocaleString('fr-FR')}
                      </span>
                    </div>
                    {readTimeMin != null && (
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lecture</span>
                        <span className="font-medium text-slate-900">~{readTimeMin} min</span>
                      </div>
                    )}
                    {output?.aiModel && (
                      <>
                        <Separator />
                        <div>
                          <span className="text-slate-600">Modèle IA</span>
                          <p className="mt-1 break-all font-mono text-xs text-slate-500">
                            {output.aiModel}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </aside>
          )}
        </div>
      )}
    </div>
  )
}
