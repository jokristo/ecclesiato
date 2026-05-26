'use client'

import { useState } from 'react'
import type { SermonListItem } from '@/types/sermon'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Calendar, Clock, User, Loader2, XCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
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

interface SermonCardProps {
  sermon: SermonListItem
  selectable?: boolean
  selected?: boolean
  onSelectChange?: (id: string, checked: boolean) => void
  onMutate?: () => void
}

const IN_PROGRESS = ['transcribing', 'processing'] as const

export function SermonCard({
  sermon,
  selectable = false,
  selected = false,
  onSelectChange,
  onMutate,
}: SermonCardProps) {
  const [busy, setBusy] = useState<'cancel' | 'delete' | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const canCancel = IN_PROGRESS.includes(sermon.status as (typeof IN_PROGRESS)[number])
  const isBusy = busy !== null

  const handleCancel = async () => {
    setBusy('cancel')
    try {
      const res = await fetch(`/api/sermons/${sermon.id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Annulation impossible')
      }
      onMutate?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async () => {
    setBusy('delete')
    try {
      const res = await fetch(`/api/sermons/${sermon.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Suppression impossible')
      }
      onMutate?.()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setBusy(null)
    }
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={(c) => onSelectChange?.(sermon.id, c === true)}
                className="mt-1"
                aria-label={`Sélectionner ${sermon.title}`}
              />
            )}
            <h3 className="text-lg font-semibold text-slate-900">{sermon.title}</h3>
          </div>
          <StatusBadge status={sermon.status} />
        </div>
        {sermon.theme && (
          <div className="inline-block">
            <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs text-indigo-700">
              {sermon.theme}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <User className="h-4 w-4" />
          <span>{sermon.preacher}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(sermon.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          <span>{sermon.duration}</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button variant="outline" className="w-full" asChild disabled={isBusy}>
          <Link href={`/sermon/${sermon.id}`}>
            {sermon.status === 'completed' ? 'Voir les détails' : 'Voir le statut'}
          </Link>
        </Button>

        <div className="flex w-full gap-2">
          {canCancel && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-1 text-amber-700 hover:text-amber-800"
                  disabled={isBusy}
                >
                  {busy === 'cancel' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  Annuler
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Annuler la transcription ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Le traitement en cours sera interrompu. La prédication repassera en attente et
                    pourra être relancée plus tard.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Non</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel}>Oui, annuler</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1 text-red-600 hover:text-red-700"
                disabled={isBusy}
              >
                {busy === 'delete' ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Supprimer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer cette prédication ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action est irréversible. L&apos;audio, la transcription et le résumé seront
                  définitivement supprimés.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleDelete}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardFooter>
    </Card>
  )
}
