import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings?userId=xxx
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return Response.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    return Response.json({ settings: settings || { darkMode: false, notifications: true } });
  } catch (err) {
    console.error('[settings:GET]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings — update settings (whitelisted fields only)
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return Response.json({ error: 'Invalid userId' }, { status: 400 });
    }

    // Only allow specific settings fields
    const updateData: { darkMode?: boolean; notifications?: boolean } = {};
    if (typeof body.darkMode === 'boolean') updateData.darkMode = body.darkMode;
    if (typeof body.notifications === 'boolean') updateData.notifications = body.notifications;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    return Response.json({ settings });
  } catch (err) {
    console.error('[settings:PUT]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
