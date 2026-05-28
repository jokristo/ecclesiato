'use client'

import { useEffect, useState } from 'react'
import {
  DEFAULT_COMPRESSION_TARGET_MB,
  DEFAULT_MAX_UPLOAD_MB,
  DEFAULT_WHISPER_MAX_MB,
  type UploadLimits,
} from '@/lib/uploadLimits'

export function useUploadLimits() {
  const [limits, setLimits] = useState<UploadLimits>({
    maxUploadSizeMb: DEFAULT_MAX_UPLOAD_MB,
    whisperMaxFileMb: DEFAULT_WHISPER_MAX_MB,
    transcriptionProvider: 'openai',
    audioCompressionEnabled: true,
    audioCompressionTargetMb: DEFAULT_COMPRESSION_TARGET_MB,
    audioCompressionMinKbps: 64,
    audioCompressionMaxKbps: 128,
    audioRetentionEnabled: true,
    audioRetentionDays: 2,
  })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    void fetch('/api/config/limits')
      .then((r) => r.json())
      .then((d) => {
        if (d.maxUploadSizeMb != null) {
          setLimits({
            maxUploadSizeMb: d.maxUploadSizeMb,
            whisperMaxFileMb: d.whisperMaxFileMb ?? DEFAULT_WHISPER_MAX_MB,
            transcriptionProvider: d.transcriptionProvider,
            audioCompressionEnabled: d.audioCompressionEnabled ?? true,
            audioCompressionTargetMb:
              d.audioCompressionTargetMb ?? DEFAULT_COMPRESSION_TARGET_MB,
            audioCompressionMinKbps: d.audioCompressionMinKbps ?? 64,
            audioCompressionMaxKbps: d.audioCompressionMaxKbps ?? 128,
            audioRetentionEnabled: d.audioRetentionEnabled ?? true,
            audioRetentionDays: d.audioRetentionDays ?? 2,
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return { limits, loaded }
}
