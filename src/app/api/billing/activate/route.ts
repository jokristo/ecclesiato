import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { serverFetch } from '@/lib/apiServer';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.subscription_id) {
    return NextResponse.json({ error: 'subscription_id required' }, { status: 400 });
  }

  const { data, status } = await serverFetch('/billing/activate', {
    method: 'POST',
    body: {
      subscription_id: body.subscription_id,
      plan: body.plan ?? undefined,
    },
  });

  if (status >= 400) {
    return NextResponse.json(
      { error: (data as { detail?: string })?.detail ?? 'Activation failed' },
      { status },
    );
  }
  return NextResponse.json(data);
}
