import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { attachSessionCookie, clearSessionCookie } from '@/lib/session';

const SALT_ROUNDS = 10;
const MAX_INPUT_LENGTH = 500;

export async function POST(req: NextRequest) {
  try {
    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { action } = body;

    if (action === 'register') {
      const { email, password, name, role, specialty } = body;

      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Email, password, and name are required' }, { status: 400 });
      }
      if (typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
        return NextResponse.json({ error: 'Invalid input types' }, { status: 400 });
      }
      if (email.length > MAX_INPUT_LENGTH || password.length > MAX_INPUT_LENGTH || name.length > MAX_INPUT_LENGTH) {
        return NextResponse.json({ error: 'Input too long' }, { status: 400 });
      }
      if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name.slice(0, 200),
          role: role === 'doctor' ? 'doctor' : 'patient',
          specialty: typeof specialty === 'string' ? specialty.slice(0, 100) : '',
        },
      });
      await prisma.userSettings.create({ data: { userId: user.id } });

      const res = NextResponse.json({ user: sanitizeUser(user) });
      return attachSessionCookie(res, user.id);
    }

    if (action === 'login') {
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }
      if (typeof email !== 'string' || typeof password !== 'string') {
        return NextResponse.json({ error: 'Invalid input types' }, { status: 400 });
      }
      if (email.length > MAX_INPUT_LENGTH || password.length > MAX_INPUT_LENGTH) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
      }

      const res = NextResponse.json({ user: sanitizeUser(user) });
      return attachSessionCookie(res, user.id);
    }

    if (action === 'logout') {
      const res = NextResponse.json({ ok: true });
      return clearSessionCookie(res);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[auth]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

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
