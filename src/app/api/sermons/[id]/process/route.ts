import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/apiServer';

/** Attend que `GET /sermons/:id` expose un transcript (job background K-Voice). */
async function waitForTranscript(
  sermonId: string,
  maxAttempts = 90,
  delayMs = 2000,
): Promise<{ ok: boolean; error?: string }> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, delayMs));
    const { data: sermon, status } = await serverFetch<any>(`/sermons/${sermonId}`);
    if (status >= 400) {
      return { ok: false, error: (sermon as any)?.detail ?? `HTTP ${status}` };
    }
    if (sermon?.status === 'failed') {
      return { ok: false, error: 'Transcription failed (sermon status failed)' };
    }
    const t = sermon?.output?.transcript;
    if (t != null && String(t).trim().length > 0) {
      return { ok: true };
    }
  }
  return { ok: false, error: 'Timeout waiting for transcript' };
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
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

    const waited = await waitForTranscript(id);
    if (!waited.ok) {
      console.warn('[process] transcript wait failed:', waited.error);
      return NextResponse.json({
        success: true,
        message: 'Transcription started but NLP not queued yet',
        sermonId: id,
        warning: waited.error,
        nlpSkipped: true,
      });
    }

    const { data: processData, status: processStatus } = await serverFetch(`/ai/process/${id}`, {
      method: 'POST',
    });

    if (processStatus >= 400) {
      console.warn('[process] /ai/process failed:', processStatus, processData);
    }

    return NextResponse.json({
      success: true,
      message: processStatus < 400 ? 'Sermon processing started' : 'Transcript ready; NLP step returned an error',
      sermonId: id,
      nlpStatus: processStatus,
      nlpDetail: (processData as any)?.detail,
    });
  } catch (error) {
    console.error('Error starting sermon processing:', error);
    return NextResponse.json({ error: 'Failed to start processing' }, { status: 500 });
  }
}
