import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/apiServer';

/** Relance uniquement le résumé NLP (transcript déjà en base). */
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

    const transcript = sermon?.output?.transcript;
    if (transcript == null || String(transcript).trim().length === 0) {
      return NextResponse.json(
        { error: 'Aucune transcription disponible. Lancez d’abord la transcription.' },
        { status: 400 },
      );
    }

    const { data: processData, status: processStatus } = await serverFetch(`/ai/process/${id}`, {
      method: 'POST',
    });

    if (processStatus >= 400) {
      return NextResponse.json(
        {
          error:
            (processData as { detail?: string })?.detail ??
            'Impossible de relancer le résumé',
        },
        { status: processStatus },
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Résumé relancé',
      sermonId: id,
      status: (processData as { status?: string })?.status,
    });
  } catch (error) {
    console.error('[retry-summary]', error);
    return NextResponse.json({ error: 'Échec de la relance du résumé' }, { status: 500 });
  }
}
