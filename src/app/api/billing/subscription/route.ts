import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { serverFetch } from '@/lib/apiServer';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, status } = await serverFetch('/billing/subscription');
  if (status >= 400) {
    return NextResponse.json(
      { error: (data as { detail?: string })?.detail ?? 'Failed to load subscription' },
      { status },
    );
  }
  return NextResponse.json(data);
}
