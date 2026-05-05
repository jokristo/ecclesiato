export type SermonStatus = 'pending' | 'transcribing' | 'processing' | 'completed' | 'failed'

export interface SermonListItem {
  id: string
  title: string
  preacher: string
  date: string
  duration: string
  status: SermonStatus
  theme?: string
}
