'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { normalizeSermonStatus } from '@/lib/sermonDisplay'

type SermonDetail = {
  id: string
  title: string
  speaker: string
  date: string
  status: string
  audioDuration?: number | null
  output?: {
    transcript?: string | null
    summary?: string | null
    keyPoints?: string[]
    mainThemes?: string[]
  } | null
}

export default function SermonDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [sermon, setSermon] = useState<SermonDetail | null>(undefined)
  const [error, setError] = useState<string | null>(null)

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

  const transcription = sermon.output?.transcript
  const summary = sermon.output?.summary
  const keyPoints = sermon.output?.keyPoints ?? []
  const theme = sermon.output?.mainThemes?.[0]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1">
          <Button variant="ghost" className="-ml-2 mb-4" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour
            </Link>
          </Button>
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{sermon.title}</h1>
            <StatusBadge status={status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2" type="button">
            <Share2 className="h-4 w-4" />
            Partager
          </Button>
          <Button variant="outline" size="sm" className="gap-2" type="button">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600">Prédicateur</p>
                <p className="font-medium text-slate-900">{sermon.speaker}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600">Date</p>
                <p className="font-medium text-slate-900">{formatDate(sermon.date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 shrink-0 text-slate-400" />
              <div>
                <p className="text-sm text-slate-600">Durée</p>
                <p className="font-medium text-slate-900">{durationLabel}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
        <Alert>
          <AlertTitle>Transcription en cours</AlertTitle>
          <AlertDescription>
            L&apos;audio est en cours de transcription. Cela peut prendre quelques minutes selon la
            durée.
          </AlertDescription>
        </Alert>
      )}

      {status === 'processing' && (
        <Alert>
          <AlertTitle>Génération du résumé</AlertTitle>
          <AlertDescription>
            La transcription est terminée. L&apos;IA génère le résumé et les points clés.
          </AlertDescription>
        </Alert>
      )}

      {(status === 'completed' || status === 'processing' || status === 'transcribing') && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Résumé</TabsTrigger>
            <TabsTrigger value="keypoints">Points clés</TabsTrigger>
            <TabsTrigger value="transcription">Transcription</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Résumé de la prédication
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <p className="leading-relaxed text-slate-700">{summary}</p>
                ) : (
                  <p className="italic text-slate-500">Le résumé est en cours de génération…</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keypoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Points clés
                </CardTitle>
              </CardHeader>
              <CardContent>
                {keyPoints.length > 0 ? (
                  <ul className="space-y-3">
                    {keyPoints.map((point, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700">
                          {index + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed text-slate-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="italic text-slate-500">Les points clés sont en cours de génération…</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transcription" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcription complète
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transcription ? (
                  <div className="max-w-none text-slate-700">
                    {transcription.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="italic text-slate-500">La transcription est en cours…</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {theme && status === 'completed' && (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-indigo-700">Thème principal :</span>
              <span className="font-semibold text-indigo-900">{theme}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
