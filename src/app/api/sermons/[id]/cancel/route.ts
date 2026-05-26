import { NextRequest, NextResponse } from 'next/server';
import { serverFetch } from '@/lib/apiServer';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data, status } = await serverFetch(`/sermons/${id}/cancel`, { method: 'POST' });

  if (status >= 400) {
    return NextResponse.json(
      { error: (data as { detail?: string }).detail ?? 'Impossible d\'annuler' },
      { status },
    );
  }

  return NextResponse.json({ success: true, ...data });
}
