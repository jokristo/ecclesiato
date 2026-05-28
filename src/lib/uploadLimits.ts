export const DEFAULT_MAX_UPLOAD_MB = 100
export const DEFAULT_WHISPER_MAX_MB = 25
export const DEFAULT_COMPRESSION_TARGET_MB = 24

export type UploadLimits = {
  maxUploadSizeMb: number
  whisperMaxFileMb: number
  transcriptionProvider?: string
  audioCompressionEnabled?: boolean
  audioCompressionTargetMb?: number
  audioCompressionMinKbps?: number
  audioCompressionMaxKbps?: number
  audioRetentionEnabled?: boolean
  audioRetentionDays?: number
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export function validateAudioFileSize(
  file: File,
  limits: UploadLimits,
): { ok: true; willCompress?: boolean } | { ok: false; message: string } {
  const maxBytes = limits.maxUploadSizeMb * 1024 * 1024
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `Fichier trop volumineux (${formatFileSize(file.size)}). Maximum : ${limits.maxUploadSizeMb} Mo.`,
    }
  }

  const whisperBytes = limits.whisperMaxFileMb * 1024 * 1024
  const compressTarget =
    (limits.audioCompressionTargetMb ?? DEFAULT_COMPRESSION_TARGET_MB) * 1024 * 1024

  if (
    limits.transcriptionProvider === 'openai' &&
    file.size > whisperBytes
  ) {
    if (limits.audioCompressionEnabled) {
      if (file.size > maxBytes) {
        return { ok: false, message: `Fichier trop volumineux (max ${limits.maxUploadSizeMb} Mo).` }
      }
      return { ok: true, willCompress: true }
    }
    return {
      ok: false,
      message: `Fichier trop volumineux pour Whisper (${formatFileSize(file.size)}). Activez la compression serveur ou réduisez le fichier.`,
    }
  }

  if (limits.audioCompressionEnabled && file.size > compressTarget) {
    return { ok: true, willCompress: true }
  }

  return { ok: true }
}
