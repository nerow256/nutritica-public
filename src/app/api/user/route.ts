import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId, unauthorized } from '@/lib/session';

const ALLOWED_FIELDS = ['name', 'email', 'age', 'height', 'weight', 'gender', 'activityLevel', 'goal', 'role', 'specialty', 'healthConditions', 'dietaryRestrictions'];
const MAX_STRING = 500;

function sanitizeUser(user: { id: string; email: string; name: string; role: string; specialty: string; age: number; height: number; weight: number; gender: string; activityLevel: string; goal: string; healthConditions: string; dietaryRestrictions: string; createdAt: Date }) {
  let healthConditions: string[] = [];
  let dietaryRestrictions: string[] = [];
  try { healthConditions = JSON.parse(user.healthConditions); } catch { /* */ }
  try { dietaryRestrictions = JSON.parse(user.dietaryRestrictions); } catch { /* */ }
  return {
    id: user.id, email: user.email, name: user.name, role: user.role, specialty: user.specialty,
    age: user.age, height: user.height, weight: user.weight, gender: user.gender,
    activityLevel: user.activityLevel, goal: user.goal,
    healthConditions, dietaryRestrictions,
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /api/user?id=xxx
export async function GET(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  if (!id || typeof id !== 'string' || id.length > 100) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }
  if (id !== sessionId) return unauthorized();

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[user:GET]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

// PUT /api/user — update user profile
export async function PUT(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  try {
    let data;
    try { data = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { id } = data;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
    }
    if (id !== sessionId) return unauthorized();

    const updateData: Record<string, unknown> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in data && data[key] !== undefined) {
        const val = data[key];
        if (key === 'healthConditions' || key === 'dietaryRestrictions') {
          updateData[key] = Array.isArray(val) ? JSON.stringify(val.map((s: unknown) => String(s).slice(0, MAX_STRING))) : '[]';
        } else if (key === 'age' || key === 'height' || key === 'weight') {
          const num = Math.round(parseFloat(String(val)) || 0);
          updateData[key] = Math.max(0, Math.min(num, 1000));
        } else if (typeof val === 'string') {
          updateData[key] = val.slice(0, MAX_STRING);
        }
      }
    }
    delete (updateData as Record<string, unknown>)['password'];

    if (updateData.email && typeof updateData.email === 'string') {
      const emailTaken = await prisma.user.findFirst({
        where: { email: updateData.email as string, id: { not: id } },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
      }
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });
    return NextResponse.json({ user: sanitizeUser(user) });
  } catch (err) {
    console.error('[user:PUT]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}

// DELETE /api/user?id=xxx
export async function DELETE(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  const id = req.nextUrl.searchParams.get('id');
  if (!id || typeof id !== 'string') {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }
  if (id !== sessionId) return unauthorized();

  try {
    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[user:DELETE]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
