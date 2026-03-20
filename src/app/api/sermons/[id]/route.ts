import { NextRequest, NextResponse } from 'next/server';
import { serverFetch, mapSermon } from '@/lib/apiServer';

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

// The k-voice backend does not expose a DELETE /sermons endpoint.
// This stub returns 501 so existing callers get a clear error instead of 404.
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return NextResponse.json(
    { error: 'Delete is not supported by the k-voice backend' },
    { status: 501 },
  );
}
