'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { SermonCard } from '@/components/k-voice/SermonCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Mic, TrendingUp, FileText, Clock, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { apiSermonToListItem, type ApiSermonLike } from '@/lib/sermonDisplay'
import type { SermonListItem } from '@/types/sermon'
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

export default function DashboardPage() {
  const { isSuperAdmin } = useAuth()
  const [sermons, setSermons] = useState<SermonListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [orgFilter, setOrgFilter] = useState<string>('all')
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([])

  const load = useCallback(async () => {
    setError(null)
    try {
      const q =
        isSuperAdmin && orgFilter !== 'all'
          ? `?organizationId=${encodeURIComponent(orgFilter)}`
          : ''
      const res = await fetch(`/api/sermons${q}`)
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
  }, [isSuperAdmin, orgFilter])

  useEffect(() => {
    if (!isSuperAdmin) return
    void fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations) setOrganizations(d.organizations)
      })
      .catch(() => {})
  }, [isSuperAdmin])

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
          {isSuperAdmin && organizations.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-slate-600">Organisation :</span>
              <Select value={orgFilter} onValueChange={setOrgFilter}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les églises</SelectItem>
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
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Prédications récentes</h2>
          {sermons.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectionMode((v) => !v)
                  setSelectedIds(new Set())
                }}
              >
                {selectionMode ? 'Annuler la sélection' : 'Sélection multiple'}
              </Button>
              {selectionMode && selectedIds.size > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                      disabled={bulkDeleting}
                    >
                      {bulkDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Supprimer ({selectedIds.size})
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Supprimer {selectedIds.size} prédication
                        {selectedIds.size > 1 ? 's' : ''} ?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible pour toutes les prédications sélectionnées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={async () => {
                          setBulkDeleting(true)
                          try {
                            const ids = [...selectedIds]
                            const results = await Promise.all(
                              ids.map((id) =>
                                fetch(`/api/sermons/${id}`, { method: 'DELETE' }),
                              ),
                            )
                            const failed = results.filter((r) => !r.ok && r.status !== 204)
                            if (failed.length > 0) {
                              throw new Error(
                                `${failed.length} suppression(s) ont échoué`,
                              )
                            }
                            setSelectedIds(new Set())
                            setSelectionMode(false)
                            await load()
                          } catch (e) {
                            alert(e instanceof Error ? e.message : 'Erreur')
                          } finally {
                            setBulkDeleting(false)
                          }
                        }}
                      >
                        Supprimer tout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {selectionMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedIds.size === sermons.length) {
                      setSelectedIds(new Set())
                    } else {
                      setSelectedIds(new Set(sermons.map((s) => s.id)))
                    }
                  }}
                >
                  {selectedIds.size === sermons.length
                    ? 'Tout désélectionner'
                    : 'Tout sélectionner'}
                </Button>
              )}
            </div>
          )}
        </div>
        {sermons.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white/50 py-12 text-center text-slate-500">
            Aucune prédication pour l&apos;instant. Enregistrez une prédication pour commencer.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sermons.map((sermon) => (
              <SermonCard
                key={sermon.id}
                sermon={sermon}
                selectable={selectionMode}
                selected={selectedIds.has(sermon.id)}
                onSelectChange={(id, checked) => {
                  setSelectedIds((prev) => {
                    const next = new Set(prev)
                    if (checked) next.add(id)
                    else next.delete(id)
                    return next
                  })
                }}
                onMutate={load}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
