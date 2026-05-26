import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { serverFetch } from '@/lib/apiServer';

function mapOrganization(o: Record<string, unknown>) {
  return {
    id: o.id,
    name: o.name,
    slug: o.slug,
    address: o.address ?? null,
    phone: o.phone ?? null,
    email: o.email ?? null,
    logo: o.logo ?? null,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, status } = await serverFetch<Record<string, unknown>[]>('/organizations');

  if (status >= 400) {
    return NextResponse.json(
      { error: (data as { detail?: string })?.detail ?? 'Failed to fetch organizations' },
      { status },
    );
  }

  const list = Array.isArray(data) ? data.map(mapOrganization) : [];
  return NextResponse.json({ success: true, organizations: list });
}
