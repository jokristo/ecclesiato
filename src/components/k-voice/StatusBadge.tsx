import type { SermonStatus } from '@/types/sermon'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, Clock, AudioLines, XCircle } from 'lucide-react'

interface StatusBadgeProps {
  status: SermonStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: 'En attente',
      variant: 'secondary' as const,
      icon: Clock,
      color: 'text-slate-600',
    },
    transcribing: {
      label: 'Transcription...',
      variant: 'default' as const,
      icon: AudioLines,
      color: 'text-blue-600',
    },
    processing: {
      label: 'Traitement...',
      variant: 'default' as const,
      icon: Loader2,
      color: 'text-purple-600',
    },
    completed: {
      label: 'Terminé',
      variant: 'default' as const,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    failed: {
      label: 'Échec',
      variant: 'destructive' as const,
      icon: XCircle,
      color: 'text-white',
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon
        className={`h-3.5 w-3.5 ${config.color} ${status === 'processing' ? 'animate-spin' : ''}`}
      />
      {config.label}
    </Badge>
  )
}
