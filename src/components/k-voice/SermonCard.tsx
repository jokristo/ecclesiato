import type { SermonListItem } from '@/types/sermon'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Calendar, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface SermonCardProps {
  sermon: SermonListItem
}

export function SermonCard({ sermon }: SermonCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-slate-900">{sermon.title}</h3>
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

      <CardFooter>
        {sermon.status === 'pending' ? (
          <Button variant="outline" className="w-full" disabled>
            Voir le statut
          </Button>
        ) : (
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/sermon/${sermon.id}`}>
              {sermon.status === 'completed' ? 'Voir les détails' : 'Voir le statut'}
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
