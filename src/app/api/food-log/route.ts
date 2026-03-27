import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_STRING = 500;

// GET /api/food-log?userId=xxx&date=yyyy-mm-dd
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId || typeof userId !== 'string' || userId.length > 100) {
    return Response.json({ error: 'Invalid userId' }, { status: 400 });
  }

  try {
    const date = req.nextUrl.searchParams.get('date');
    const where: { userId: string; date?: string } = { userId };
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) where.date = date;

    const entries = await prisma.foodLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    return Response.json({ entries });
  } catch (err) {
    console.error('[food-log:GET]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to fetch food logs' }, { status: 500 });
  }
}

// POST /api/food-log — create entry (whitelisted fields only)
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { userId, date, mealType, foodName, amount, calories, protein, carbs, fat } = data;

    if (!userId || !date || !foodName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const dateStr = String(date).slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return Response.json({ error: 'Invalid date format (YYYY-MM-DD)' }, { status: 400 });
    }

    const entry = await prisma.foodLog.create({
      data: {
        userId: String(userId).slice(0, 100),
        date: dateStr,
        mealType: String(mealType || 'other').slice(0, 50),
        foodName: String(foodName).slice(0, MAX_STRING),
        amount: Math.max(0, Math.min(Number(amount) || 0, 100000)),
        calories: Math.max(0, Math.min(Number(calories) || 0, 100000)),
        protein: Math.max(0, Math.min(Number(protein) || 0, 100000)),
        carbs: Math.max(0, Math.min(Number(carbs) || 0, 100000)),
        fat: Math.max(0, Math.min(Number(fat) || 0, 100000)),
      },
    });
    return Response.json({ entry });
  } catch (err) {
    console.error('[food-log:POST]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to create food log' }, { status: 500 });
  }
}

// PUT /api/food-log — update entry (whitelisted fields only)
export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const { id, userId } = data;
    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.foodLog.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: 'Entry not found' }, { status: 404 });
    if (userId && existing.userId !== userId) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.date) updateData.date = String(data.date).slice(0, 20);
    if (data.mealType) updateData.mealType = String(data.mealType).slice(0, 50);
    if (data.foodName) updateData.foodName = String(data.foodName).slice(0, MAX_STRING);
    if (data.amount !== undefined) updateData.amount = Math.max(0, Math.min(Number(data.amount) || 0, 100000));
    if (data.calories !== undefined) updateData.calories = Math.max(0, Math.min(Number(data.calories) || 0, 100000));
    if (data.protein !== undefined) updateData.protein = Math.max(0, Math.min(Number(data.protein) || 0, 100000));
    if (data.carbs !== undefined) updateData.carbs = Math.max(0, Math.min(Number(data.carbs) || 0, 100000));
    if (data.fat !== undefined) updateData.fat = Math.max(0, Math.min(Number(data.fat) || 0, 100000));

    const entry = await prisma.foodLog.update({ where: { id }, data: updateData });
    return Response.json({ entry });
  } catch (err) {
    console.error('[food-log:PUT]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to update food log' }, { status: 500 });
  }
}

// DELETE /api/food-log?id=xxx&userId=xxx  OR  /api/food-log?userId=xxx (bulk delete)
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const userId = req.nextUrl.searchParams.get('userId');

  try {
    // Bulk delete all food logs for a user
    if (!id && userId && typeof userId === 'string' && userId.length <= 100) {
      await prisma.foodLog.deleteMany({ where: { userId } });
      return Response.json({ success: true });
    }

    if (!id || typeof id !== 'string') {
      return Response.json({ error: 'Invalid id' }, { status: 400 });
    }

    // Verify ownership before deleting
    const existing = await prisma.foodLog.findUnique({ where: { id } });
    if (!existing) return Response.json({ error: 'Entry not found' }, { status: 404 });
    if (userId && existing.userId !== userId) {
      return Response.json({ error: 'Not authorized' }, { status: 403 });
    }

    await prisma.foodLog.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (err) {
    console.error('[food-log:DELETE]', err instanceof Error ? err.message : 'Unknown error');
    return Response.json({ error: 'Failed to delete food log' }, { status: 500 });
  }
}
