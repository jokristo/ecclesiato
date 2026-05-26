import { NextRequest, NextResponse } from 'next/server';
import { serverFetch, serverFetchNoContent, mapSermon } from '@/lib/apiServer';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { data, status } = await serverFetch<any>(`/sermons/${id}`);

  if (status >= 400) {
    return NextResponse.json(
      { error: (data as any).detail ?? 'Sermon not found' },
      { status },
    );
  }

  return NextResponse.json({ success: true, sermon: mapSermon(data) });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await serverFetchNoContent(`/sermons/${id}`);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return new NextResponse(null, { status: 204 });
}
