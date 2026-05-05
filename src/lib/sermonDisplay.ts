import type { SermonListItem, SermonStatus } from '@/types/sermon'

function pad2(n: number) {
  return n.toString().padStart(2, '0')
}

export function formatAudioDurationLabel(seconds: number | null | undefined): string {
  if (seconds == null || Number.isNaN(seconds) || seconds < 0) {
    return '—'
  }
  const s = Math.floor(seconds % 60)
  const m = Math.floor((seconds / 60) % 60)
  const h = Math.floor(seconds / 3600)
  if (h > 0) {
    return `${h}:${pad2(m)}:${pad2(s)}`
  }
  return `${m}:${pad2(s)}`
}

const VALID: SermonStatus[] = ['pending', 'transcribing', 'processing', 'completed', 'failed']

export function normalizeSermonStatus(raw: string | undefined | null): SermonStatus {
  if (raw && (VALID as string[]).includes(raw)) {
    return raw as SermonStatus
  }
  return 'pending'
}

export type ApiSermonLike = {
  id: string
  title: string
  speaker: string
  date: string
  status: string
  audioDuration?: number | null
  output?: { mainThemes?: string[]; summary?: string | null; transcript?: string | null; keyPoints?: string[] } | null
}

export function apiSermonToListItem(s: ApiSermonLike): SermonListItem {
  const theme = s.output?.mainThemes?.[0]
  return {
    id: s.id,
    title: s.title,
    preacher: s.speaker,
    date: s.date,
    duration: formatAudioDurationLabel(s.audioDuration),
    status: normalizeSermonStatus(s.status),
    ...(theme ? { theme } : {}),
  }
}
