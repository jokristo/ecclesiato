import { NextRequest, NextResponse } from 'next/server';
import { serverFetch, mapOutput } from '@/lib/apiServer';

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

  if (!sermon.output) {
    return NextResponse.json({ error: 'Output not available yet' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    sermon: {
      id: sermon.id,
      title: sermon.title,
      speaker: sermon.speaker,
      date: sermon.date,
      audioUrl: sermon.audio_url ?? null,
      status: sermon.status,
    },
    output: mapOutput(sermon.output),
  });
}
