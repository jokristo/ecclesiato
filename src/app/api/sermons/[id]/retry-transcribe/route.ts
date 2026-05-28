import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/apiServer';

/** Relance la transcription (audio déjà uploadé). */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const { data: sermon, status: getStatus } = await serverFetch<any>(`/sermons/${id}`);

    if (getStatus >= 400) {
      return NextResponse.json(
        { error: (sermon as { detail?: string })?.detail ?? 'Prédication introuvable' },
        { status: getStatus },
      );
    }

    if (!sermon?.audio_url) {
      return NextResponse.json(
        {
          error:
            'Fichier audio introuvable. Réimportez la prédication ou vérifiez la rétention (2 jours).',
        },
        { status: 400 },
      );
    }

    const { data: transcribeData, status: transcribeStatus } = await serverFetch(
      `/sermons/${id}/transcribe`,
      { method: 'POST' },
    );

    if (transcribeStatus >= 400) {
      return NextResponse.json(
        {
          error:
            (transcribeData as { detail?: string })?.detail ??
            'Impossible de relancer la transcription',
        },
        { status: transcribeStatus },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Transcription relancée',
      sermonId: id,
      status: (transcribeData as { status?: string })?.status,
    });
  } catch (error) {
    console.error('[retry-transcribe]', error);
    return NextResponse.json({ error: 'Échec de la relance de la transcription' }, { status: 500 });
  }
}
