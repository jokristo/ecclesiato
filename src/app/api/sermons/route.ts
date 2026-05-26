import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { serverFetch, mapSermon } from '@/lib/apiServer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  const orgFromQuery = searchParams.get('organizationId');

  if (orgFromQuery) {
    params.set('org_id', orgFromQuery);
  } else if (role !== 'super_admin') {
    const orgId = (session as any)?.organizationId as string | undefined;
    if (orgId) params.set('org_id', orgId);
  }

  if (searchParams.get('status')) params.set('status', searchParams.get('status')!);
  if (searchParams.get('speaker')) params.set('speaker', searchParams.get('speaker')!);

  const query = params.toString() ? `?${params}` : '';

  const { data, status } = await serverFetch<any[]>(`/sermons${query}`);

  if (status >= 400) {
    return NextResponse.json({ error: (data as any).detail ?? 'Failed to fetch sermons' }, { status });
  }

  return NextResponse.json({
    success: true,
    sermons: Array.isArray(data) ? data.map(mapSermon) : [],
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const title = formData.get('title') as string;
    const speaker = formData.get('speaker') as string;
    const date = formData.get('date') as string;
    const description = formData.get('description') as string | null;
    const organizationId = formData.get('organizationId') as string | null;
    const audioFile = formData.get('audio') as File | null;

    if (!title || !speaker || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    const role = (session as any)?.role as string | undefined;

    const body: Record<string, unknown> = {
      title,
      speaker,
      date,
      description: description || null,
    };

    if (organizationId && role === 'super_admin') {
      body.organization_id = organizationId;
    }

    const { data: sermon, status: createStatus } = await serverFetch<any>('/sermons', {
      method: 'POST',
      body,
    });

    if (createStatus >= 400) {
      return NextResponse.json(
        { error: (sermon as any).detail ?? 'Failed to create sermon' },
        { status: createStatus },
      );
    }

    if (audioFile) {
      const uploadForm = new FormData();
      uploadForm.append('file', audioFile);

      const { status: uploadStatus, data: uploadData } = await serverFetch(`/sermons/${sermon.id}/upload`, {
        method: 'POST',
        body: uploadForm,
        isFormData: true,
      });

      if (uploadStatus >= 400) {
        return NextResponse.json(
          { error: (uploadData as any)?.detail ?? 'Failed to upload audio', sermon: mapSermon(sermon) },
          { status: uploadStatus },
        );
      }

      const { data: transcribeData, status: transcribeStatus } = await serverFetch(
        `/sermons/${sermon.id}/transcribe`,
        { method: 'POST' },
      );

      if (transcribeStatus >= 400) {
        console.warn('[sermons POST] transcribe failed:', transcribeStatus, transcribeData);
      }
    }

    const { data: refreshed, status: getStatus } = await serverFetch<any>(`/sermons/${sermon.id}`);
    const out = getStatus < 400 ? mapSermon(refreshed) : mapSermon(sermon);

    return NextResponse.json({ success: true, sermon: out });
  } catch (error) {
    console.error('Error creating sermon:', error);
    return NextResponse.json({ error: 'Failed to create sermon' }, { status: 500 });
  }
}
