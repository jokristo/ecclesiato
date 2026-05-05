import { KVoiceShell } from '@/components/k-voice/KVoiceShell'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <KVoiceShell>{children}</KVoiceShell>
}
