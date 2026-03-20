import { NextRequest, NextResponse } from 'next/server';
import { serverFetch, mapSermon } from '@/lib/apiServer';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const params = new URLSearchParams();
  if (searchParams.get('organizationId')) params.set('org_id', searchParams.get('organizationId')!);
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
    const organizationId = formData.get('organizationId') as string;
    const recordedById = formData.get('recordedById') as string;
    const audioFile = formData.get('audio') as File | null;

    if (!title || !speaker || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create sermon metadata
    const { data: sermon, status: createStatus } = await serverFetch<any>('/sermons', {
      method: 'POST',
      body: {
        title,
        speaker,
        date,
        description: description || null,
        organization_id: organizationId || 'default',
        recorded_by_id: recordedById || 'default',
      },
    });

    if (createStatus >= 400) {
      return NextResponse.json(
        { error: (sermon as any).detail ?? 'Failed to create sermon' },
        { status: createStatus },
      );
    }

    // 2. Upload audio if provided
    if (audioFile) {
      const uploadForm = new FormData();
      uploadForm.append('file', audioFile);

      await serverFetch(`/sermons/${sermon.id}/upload`, {
        method: 'POST',
        body: uploadForm,
        isFormData: true,
      });
    }

    return NextResponse.json({ success: true, sermon: mapSermon(sermon) });
  } catch (error) {
    console.error('Error creating sermon:', error);
    return NextResponse.json({ error: 'Failed to create sermon' }, { status: 500 });
  }
}
