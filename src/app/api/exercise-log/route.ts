import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_STRING = 500;

// GET /api/exercise-log?userId=xxx&date=yyyy-mm-dd
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return Response.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    const date = req.nextUrl.searchParams.get('date');
    const where: { userId: string; date?: string } = { userId };
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) where.date = date;

    const entries = await prisma.exerciseLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    return Response.json({ entries });
  } catch (err) {
    console.error('[exercise-log:GET]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to fetch exercise logs' }, { status: 500 });
  }
}

// POST /api/exercise-log — create entry (whitelisted fields only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, date, exerciseName, duration, caloriesBurned } = data;

    if (!userId || !date || !exerciseName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const dateStr = String(date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return Response.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }

    const entry = await prisma.exerciseLog.create({
      data: {
        userId: String(userId).slice(0, 100),
        date: dateStr,
        exerciseName: String(exerciseName).slice(0, MAX_STRING),
        duration: Math.max(0, Math.min(Number(duration) || 0, 100000)),
        caloriesBurned: Math.max(0, Math.min(Number(caloriesBurned) || 0, 100000)),
      },
    });
    return Response.json({ entry });
  } catch (err) {
    console.error('[exercise-log:POST]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to create exercise log' }, { status: 500 });
  }
}

// DELETE /api/exercise-log?id=xxx&userId=xxx  OR  /api/exercise-log?userId=xxx (bulk delete)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const userId = req.nextUrl.searchParams.get('userId');

  try {
    // Bulk delete all exercise logs for a user
    if (!id && userId && typeof userId === 'string' && userId.length <= 100) {
      await prisma.exerciseLog.deleteMany({ where: { userId } });
      return Response.json({ success: true });
    }

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Verify ownership before deleting
    const existing = await prisma.exerciseLog.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: 'Entry not found' }, { status: 404 });
    if (userId && existing.userId !== userId) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.exerciseLog.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    console.error('[exercise-log:DELETE]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to delete exercise log' }, { status: 500 });
  }
}
