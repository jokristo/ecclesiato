/**
 * Export prédication en PDF (client uniquement — pdfmake + polices UTF-8).
 */

export type SermonExportContent = {
  title: string
  speaker: string
  date: string
  centralMessage?: string | null
  summary?: string | null
  keyPoints?: string[]
  mainThemes?: string[]
  keyVerses?: string[]
  references?: string[]
  transcript?: string | null
  /** Si true, n'inclut que titre + métadonnées + transcription */
  transcriptOnly?: boolean
}

export function safeExportFilename(title: string): string {
  const base = title.replace(/[^\w\s-àâäéèêëïîôùûüçœæÀÂÄÉÈÊËÏÎÔÙÛÜÇŒÆ]/gi, '').trim()
  return base || 'predication'
}

export function buildSermonExportContent(params: {
  title: string
  speaker: string
  date: string
  output?: {
    transcript?: string | null
    summary?: string | null
    keyPoints?: string[]
    mainThemes?: string[]
    keyVerses?: { reference: string }[] | string[]
    references?: string[]
    nlpMetadata?: {
      centralMessage?: string | null
      correctedTranscript?: string | null
    } | null
  } | null
  transcriptOnly?: boolean
}): SermonExportContent {
  const meta = params.output?.nlpMetadata
  const keyVersesRaw = params.output?.keyVerses ?? []
  const keyVerses = keyVersesRaw.map((v) =>
    typeof v === 'string' ? v : v.reference,
  )

  return {
    title: params.title,
    speaker: params.speaker,
    date: params.date,
    centralMessage: meta?.centralMessage,
    summary: params.output?.summary,
    keyPoints: params.output?.keyPoints,
    mainThemes: params.output?.mainThemes,
    keyVerses,
    references: params.output?.references,
    transcript: meta?.correctedTranscript || params.output?.transcript,
    transcriptOnly: params.transcriptOnly,
  }
}

type PdfContent = Record<string, unknown>

function sectionTitle(text: string): PdfContent {
  return { text, style: 'sectionTitle', margin: [0, 14, 0, 6] as [number, number, number, number] }
}

function bodyParagraph(text: string): PdfContent {
  return { text, style: 'body', margin: [0, 0, 0, 8] as [number, number, number, number] }
}

function buildPdfDefinition(content: SermonExportContent): { content: PdfContent[]; styles: Record<string, PdfContent> } {
  const dateLabel = new Date(content.date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const blocks: PdfContent[] = [
    { text: 'K-Voice', style: 'brand', margin: [0, 0, 0, 4] as [number, number, number, number] },
    { text: content.title, style: 'header' },
    {
      text: `Prédicateur : ${content.speaker}\nDate : ${dateLabel}`,
      style: 'meta',
      margin: [0, 0, 0, 12] as [number, number, number, number],
    },
  ]

  if (!content.transcriptOnly) {
    if (content.centralMessage?.trim()) {
      blocks.push(sectionTitle('Message central'))
      blocks.push(bodyParagraph(content.centralMessage.trim()))
    }
    if (content.summary?.trim()) {
      blocks.push(sectionTitle('Résumé pastoral'))
      blocks.push(bodyParagraph(content.summary.trim()))
    }
    if (content.keyPoints?.length) {
      blocks.push(sectionTitle('Points clés'))
      blocks.push({
        ol: content.keyPoints.map((p) => p.trim()).filter(Boolean),
        style: 'body',
        margin: [0, 0, 0, 8] as [number, number, number, number],
      })
    }
    if (content.mainThemes?.length) {
      blocks.push(sectionTitle('Thèmes principaux'))
      blocks.push({
        ul: content.mainThemes.map((t) => t.trim()).filter(Boolean),
        style: 'body',
        margin: [0, 0, 0, 8] as [number, number, number, number],
      })
    }
    if (content.keyVerses?.length) {
      blocks.push(sectionTitle('Versets cités'))
      blocks.push({
        ul: content.keyVerses.map((v) => v.trim()).filter(Boolean),
        style: 'body',
        margin: [0, 0, 0, 8] as [number, number, number, number],
      })
    }
    if (content.references?.length) {
      blocks.push(sectionTitle('Références'))
      blocks.push({
        ul: content.references.map((r) => r.trim()).filter(Boolean),
        style: 'body',
        margin: [0, 0, 0, 8] as [number, number, number, number],
      })
    }
  }

  if (content.transcript?.trim()) {
    blocks.push(sectionTitle('Transcription'))
    blocks.push(bodyParagraph(content.transcript.trim()))
  }

  if (blocks.length <= 3) {
    blocks.push(
      bodyParagraph(
        'Aucun contenu exportable pour le moment. Relancez le traitement ou attendez la fin de la transcription.',
      ),
    )
  }

  return {
    content: blocks,
    styles: {
      brand: { fontSize: 9, color: '#4f46e5', bold: true },
      header: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] as [number, number, number, number] },
      meta: { fontSize: 11, color: '#475569' },
      sectionTitle: { fontSize: 13, bold: true, color: '#1e293b' },
      body: { fontSize: 11, lineHeight: 1.35 },
    },
  }
}

export async function downloadSermonPdf(
  content: SermonExportContent,
  filename?: string,
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Export PDF disponible uniquement dans le navigateur')
  }

  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

  const pdfMake = pdfMakeModule.default
  const fonts = pdfFontsModule as {
    pdfMake?: { vfs: Record<string, string> }
    vfs?: Record<string, string>
  }
  pdfMake.vfs = fonts.pdfMake?.vfs ?? fonts.vfs ?? {}

  const { content: pdfContent, styles } = buildPdfDefinition(content)
  const name = `${filename ?? safeExportFilename(content.title)}.pdf`

  const doc = pdfMake.createPdf({
    pageSize: 'A4',
    pageMargins: [48, 56, 48, 56],
    defaultStyle: { font: 'Roboto', fontSize: 11 },
    content: pdfContent,
    styles,
    footer: (currentPage: number, pageCount: number) => ({
      text: `K-Voice — ${currentPage} / ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#94a3b8',
      margin: [0, 8, 0, 0],
    }),
  })

  doc.download(name)
}
