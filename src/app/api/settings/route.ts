import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId, unauthorized } from '@/lib/session';

// GET /api/settings?userId=xxx
export async function GET(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }
  if (userId !== sessionId) return unauthorized();

  try {
    const settings = await prisma.userSettings.findUnique({ where: { userId } });
    return NextResponse.json({ settings: settings || { darkMode: false, notifications: true } });
  } catch (err) {
    console.error('[settings:GET]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT /api/settings — update settings (whitelisted fields only)
export async function PUT(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  try {
    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { userId } = body;
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
    }
    if (userId !== sessionId) return unauthorized();

    // Only allow specific settings fields
    const updateData: { darkMode?: boolean; notifications?: boolean } = {};
    if (typeof body.darkMode === 'boolean') updateData.darkMode = body.darkMode;
    if (typeof body.notifications === 'boolean') updateData.notifications = body.notifications;

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[settings:PUT]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
