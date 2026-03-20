import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/apiServer';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    // 1. Trigger transcription (sets status → transcribing, runs background job)
    const { data: transcribeData, status: transcribeStatus } = await serverFetch(
      `/sermons/${id}/transcribe`,
      { method: 'POST' },
    );

    if (transcribeStatus >= 400) {
      return NextResponse.json(
        { error: (transcribeData as any).detail ?? 'Failed to start transcription' },
        { status: transcribeStatus },
      );
    }

    // 2. Trigger NLP post-processing (summary, key points, themes…)
    //    This runs in the background too — ignore errors since transcription may not be done yet.
    serverFetch(`/ai/process/${id}`, { method: 'POST' }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Sermon processing started',
      sermonId: id,
    });
  } catch (error) {
    console.error('Error starting sermon processing:', error);
    return NextResponse.json({ error: 'Failed to start processing' }, { status: 500 });
  }
}
