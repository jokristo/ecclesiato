import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const FALLBACK = {
  maxUploadSizeMb: 100,
  whisperMaxFileMb: 25,
  transcriptionProvider: 'openai',
  audioCompressionEnabled: true,
  audioCompressionTargetMb: 24,
  audioCompressionMinKbps: 64,
  audioCompressionMaxKbps: 128,
  audioRetentionEnabled: true,
  audioRetentionDays: 2,
}

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/config/limits`, { next: { revalidate: 60 } })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(FALLBACK)
    }
    return NextResponse.json({
      maxUploadSizeMb: data.max_upload_size_mb ?? FALLBACK.maxUploadSizeMb,
      whisperMaxFileMb: data.whisper_max_file_mb ?? FALLBACK.whisperMaxFileMb,
      transcriptionProvider: data.transcription_provider ?? FALLBACK.transcriptionProvider,
      audioCompressionEnabled: data.audio_compression_enabled ?? FALLBACK.audioCompressionEnabled,
      audioCompressionTargetMb:
        data.audio_compression_target_mb ?? FALLBACK.audioCompressionTargetMb,
      audioCompressionMinKbps: data.audio_compression_min_kbps ?? FALLBACK.audioCompressionMinKbps,
      audioCompressionMaxKbps: data.audio_compression_max_kbps ?? FALLBACK.audioCompressionMaxKbps,
      audioRetentionEnabled:
        data.audio_retention_enabled ?? FALLBACK.audioRetentionEnabled,
      audioRetentionDays: data.audio_retention_days ?? FALLBACK.audioRetentionDays,
    })
  } catch {
    return NextResponse.json(FALLBACK)
  }
}
