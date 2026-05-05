'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { SermonCard } from '@/components/k-voice/SermonCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, TrendingUp, FileText, Clock, Loader2 } from 'lucide-react'
import { apiSermonToListItem, type ApiSermonLike } from '@/lib/sermonDisplay'
import type { SermonListItem } from '@/types/sermon'

export default function DashboardPage() {
  const [sermons, setSermons] = useState<SermonListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/sermons')
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Impossible de charger les prédications')
      }
      const list = (data.sermons ?? []) as ApiSermonLike[]
      setSermons(list.map((s) => apiSermonToListItem(s)))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const stats = {
    total: sermons.length,
    completed: sermons.filter((s) => s.status === 'completed').length,
    processing: sermons.filter(
      (s) => s.status === 'transcribing' || s.status === 'processing',
    ).length,
    pending: sermons.filter((s) => s.status === 'pending').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Chargement…
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">Gérez vos prédications et transcriptions</p>
        </div>
        <Button asChild size="lg" className="w-full gap-2 bg-indigo-600 hover:bg-indigo-600/90 sm:w-auto">
          <Link href="/record">
            <Mic className="h-5 w-5" />
            Nouvelle prédication
          </Link>
        </Button>
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Prédications</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <p className="mt-1 text-xs text-slate-600">Enregistrées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Terminées</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="mt-1 text-xs text-slate-600">Transcrites et résumées</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">En traitement</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.processing}</div>
            <p className="mt-1 text-xs text-slate-600">En cours d&apos;analyse</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">En attente</CardTitle>
            <Mic className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats.pending}</div>
            <p className="mt-1 text-xs text-slate-600">À traiter</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Prédications récentes</h2>
        {sermons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white/50 py-12 text-center text-slate-500">
            Aucune prédication pour l&apos;instant. Enregistrez une prédication pour commencer.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
