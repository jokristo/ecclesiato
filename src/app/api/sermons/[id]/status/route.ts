import { NextRequest, NextResponse } from 'next/server';
import { serverFetch, PROGRESS_MAP } from '@/lib/apiServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data: sermon, status } = await serverFetch<any>(`/sermons/${id}`);

  if (status >= 400) {
    return NextResponse.json(
      { error: (sermon as any).detail ?? 'Sermon not found' },
      { status },
    );
  }

  const currentStatus: string = sermon.status ?? 'pending';

  return NextResponse.json({
    success: true,
    status: {
      id: sermon.id,
      title: sermon.title,
      speaker: sermon.speaker,
      currentStatus,
      progress: PROGRESS_MAP[currentStatus] ?? 0,
      hasTranscript: !!sermon.output?.transcript,
      hasSummary: !!sermon.output?.summary,
      transcriptWords: sermon.output?.transcript_words ?? 0,
      createdAt: sermon.created_at,
      transcribedAt: sermon.transcribed_at ?? null,
      processedAt: sermon.processed_at ?? null,
      processingTime: sermon.output?.processing_time ?? null,
    },
  });
}
