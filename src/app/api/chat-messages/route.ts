import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId, unauthorized } from '@/lib/session';

const MAX_CONTENT = 10000;

// GET /api/chat-messages?userId=xxx
export async function GET(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }
  if (userId !== sessionId) return unauthorized();

  try {
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    return NextResponse.json({ messages });
  } catch (err) {
    console.error('[chat-messages:GET]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/chat-messages — create message (whitelisted fields only)
export async function POST(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  try {
    let data;
    try { data = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { userId, role, content, timestamp } = data;

    if (!userId || !role || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (userId !== sessionId) return unauthorized();
    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: String(userId).slice(0, 100),
        role: String(role),
        content: String(content).slice(0, MAX_CONTENT),
        timestamp: String(timestamp || new Date().toISOString()).slice(0, 50),
      },
    });
    return NextResponse.json({ message });
  } catch (err) {
    console.error('[chat-messages:POST]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
  }
}

// DELETE /api/chat-messages?userId=xxx — clear all messages for user
export async function DELETE(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }
  if (userId !== sessionId) return unauthorized();

  try {
    await prisma.chatMessage.deleteMany({ where: { userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[chat-messages:DELETE]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to delete messages' }, { status: 500 });
  }
}
