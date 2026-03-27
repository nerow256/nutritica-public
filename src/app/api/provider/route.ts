import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUserId, unauthorized } from '@/lib/session';
import crypto from 'crypto';

const MAX_STRING = 500;
const MAX_MESSAGE = 5000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB base64 limit
const VALID_ACTIONS = ['generate', 'validate', 'save-patient', 'remove-patient', 'get-patients', 'get-patient-data', 'send-message', 'get-messages', 'get-conversations', 'search-patients', 'mark-read', 'get-unread-counts'];

function generateCode(): string {
  const bytes = crypto.randomBytes(8);
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length];
    if (i === 3) code += '-';
  }
  return code;
}

function sanitizeId(val: unknown): string | null {
  if (!val || typeof val !== 'string' || val.length > 100) return null;
  return val;
}

// POST /api/provider — generate a share code, validate one, save patient, or send message
export async function POST(req: NextRequest) {
  const sessionId = getSessionUserId(req);
  if (!sessionId) return unauthorized();

  try {
    let body;
    try { body = await req.json(); } catch {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    const { action } = body;

    if (!action || typeof action !== 'string' || !VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // ── Generate access code (patient side) ──
    if (action === 'generate') {
      const userId = sanitizeId(body.userId);
      if (!userId) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      if (userId !== sessionId) return unauthorized();

      const shareCode = generateCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Atomic: delete old codes and create new one in a single transaction
      await prisma.$transaction([
        prisma.providerAccess.deleteMany({ where: { userId } }),
        prisma.providerAccess.create({
          data: { code: shareCode, userId, expiresAt },
        }),
      ]);

      return NextResponse.json({ code: shareCode, expiresAt: expiresAt.toISOString() });
    }

    // ── Validate access code (doctor side) — sessionId is the doctor ──
    if (action === 'validate') {
      const code = body.code;
      if (!code || typeof code !== 'string' || code.length > 20) {
        return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
      }

      const access = await prisma.providerAccess.findUnique({
        where: { code: code.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 9) },
        include: {
          user: {
            include: {
              foodLogs: { orderBy: { date: 'desc' }, take: 100 },
              exerciseLogs: { orderBy: { date: 'desc' }, take: 100 },
            },
          },
        },
      });

      if (!access) {
        return NextResponse.json({ error: 'Invalid access code' }, { status: 404 });
      }

      if (new Date() > access.expiresAt) {
        return NextResponse.json({ error: 'Access code has expired' }, { status: 410 });
      }

      const user = access.user;
      let healthConditions: string[] = [];
      let dietaryRestrictions: string[] = [];
      try { healthConditions = JSON.parse(user.healthConditions); } catch { /* */ }
      try { dietaryRestrictions = JSON.parse(user.dietaryRestrictions); } catch { /* */ }

      return NextResponse.json({
        patientId: user.id,
        patient: {
          id: user.id,
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          activityLevel: user.activityLevel,
          goal: user.goal,
          healthConditions,
          dietaryRestrictions,
          createdAt: user.createdAt.toISOString(),
        },
        foodLogs: user.foodLogs.map(f => ({
          date: f.date, mealType: f.mealType, foodName: f.foodName,
          amount: f.amount, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
        })),
        exerciseLogs: user.exerciseLogs.map(e => ({
          date: e.date, exerciseName: e.exerciseName, duration: e.duration, caloriesBurned: e.caloriesBurned,
        })),
      });
    }

    // ── Save patient (doctor side) ──
    if (action === 'save-patient') {
      const doctorId = sanitizeId(body.doctorId);
      const patientId = sanitizeId(body.patientId);
      if (!doctorId || !patientId) return NextResponse.json({ error: 'Invalid doctorId or patientId' }, { status: 400 });
      if (doctorId !== sessionId) return unauthorized();

      const existing = await prisma.doctorPatient.findUnique({
        where: { doctorId_patientId: { doctorId, patientId } },
      });
      if (existing) return NextResponse.json({ ok: true, message: 'Already saved' });

      await prisma.doctorPatient.create({ data: { doctorId, patientId } });
      return NextResponse.json({ ok: true });
    }

    // ── Remove patient (doctor side) ──
    if (action === 'remove-patient') {
      const doctorId = sanitizeId(body.doctorId);
      const patientId = sanitizeId(body.patientId);
      if (!doctorId || !patientId) return NextResponse.json({ error: 'Invalid doctorId or patientId' }, { status: 400 });
      if (doctorId !== sessionId) return unauthorized();

      await prisma.doctorPatient.deleteMany({ where: { doctorId, patientId } });
      return NextResponse.json({ ok: true });
    }

    // ── Get saved patients list (doctor side) ──
    if (action === 'get-patients') {
      const doctorId = sanitizeId(body.doctorId);
      if (!doctorId) return NextResponse.json({ error: 'Invalid doctorId' }, { status: 400 });
      if (doctorId !== sessionId) return unauthorized();

      const relations = await prisma.doctorPatient.findMany({
        where: { doctorId },
        include: { patient: { select: { id: true, name: true, age: true, gender: true, weight: true, height: true, goal: true } } },
        orderBy: { addedAt: 'desc' },
      });

      return NextResponse.json({
        patients: relations.map(r => ({
          id: r.patient.id,
          name: r.patient.name,
          age: r.patient.age,
          gender: r.patient.gender,
          weight: r.patient.weight,
          height: r.patient.height,
          goal: r.patient.goal,
          addedAt: r.addedAt.toISOString(),
        })),
      });
    }

    // ── Get patient full data (doctor side, for saved patients) ──
    if (action === 'get-patient-data') {
      const doctorId = sanitizeId(body.doctorId);
      const patientId = sanitizeId(body.patientId);
      if (!doctorId || !patientId) return NextResponse.json({ error: 'Invalid doctorId or patientId' }, { status: 400 });
      if (doctorId !== sessionId) return unauthorized();

      // Verify doctor has this patient saved
      const relation = await prisma.doctorPatient.findUnique({
        where: { doctorId_patientId: { doctorId, patientId } },
      });
      if (!relation) return NextResponse.json({ error: 'Patient not found in your list' }, { status: 403 });

      const user = await prisma.user.findUnique({
        where: { id: patientId },
        include: {
          foodLogs: { orderBy: { date: 'desc' }, take: 100 },
          exerciseLogs: { orderBy: { date: 'desc' }, take: 100 },
        },
      });
      if (!user) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

      let hc: string[] = [];
      let dr: string[] = [];
      try { hc = JSON.parse(user.healthConditions); } catch { /* */ }
      try { dr = JSON.parse(user.dietaryRestrictions); } catch { /* */ }

      return NextResponse.json({
        patient: {
          id: user.id, name: user.name, age: user.age, height: user.height, weight: user.weight,
          gender: user.gender, activityLevel: user.activityLevel, goal: user.goal,
          healthConditions: hc,
          dietaryRestrictions: dr,
          createdAt: user.createdAt.toISOString(),
        },
        foodLogs: user.foodLogs.map(f => ({
          date: f.date, mealType: f.mealType, foodName: f.foodName,
          amount: f.amount, calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
        })),
        exerciseLogs: user.exerciseLogs.map(e => ({
          date: e.date, exerciseName: e.exerciseName, duration: e.duration, caloriesBurned: e.caloriesBurned,
        })),
      });
    }

    // ── Send message (with optional image) ──
    if (action === 'send-message') {
      const senderId = sanitizeId(body.senderId);
      const receiverId = sanitizeId(body.receiverId);
      const content = typeof body.content === 'string' ? body.content.trim().slice(0, MAX_MESSAGE) : '';
      const imageUrl = typeof body.imageUrl === 'string' && body.imageUrl.startsWith('data:image/')
        ? body.imageUrl.slice(0, MAX_IMAGE_SIZE) : '';

      if (!senderId || !receiverId || (!content && !imageUrl)) {
        return NextResponse.json({ error: 'Invalid senderId, receiverId, or content' }, { status: 400 });
      }
      if (senderId !== sessionId) return unauthorized();

      const msg = await prisma.doctorMessage.create({
        data: { senderId, receiverId, content, imageUrl },
      });

      return NextResponse.json({ message: { id: msg.id, senderId: msg.senderId, receiverId: msg.receiverId, content: msg.content, imageUrl: msg.imageUrl, createdAt: msg.createdAt.toISOString() } });
    }

    // ── Get messages between two users ──
    if (action === 'get-messages') {
      const userId = sanitizeId(body.userId);
      const otherUserId = sanitizeId(body.otherUserId);
      if (!userId || !otherUserId) return NextResponse.json({ error: 'Invalid userId or otherUserId' }, { status: 400 });
      if (userId !== sessionId) return unauthorized();

      const messages = await prisma.doctorMessage.findMany({
        where: {
          OR: [
            { senderId: userId, receiverId: otherUserId },
            { senderId: otherUserId, receiverId: userId },
          ],
        },
        orderBy: { createdAt: 'asc' },
        take: 200,
      });

      return NextResponse.json({
        messages: messages.map(m => ({
          id: m.id, senderId: m.senderId, receiverId: m.receiverId,
          content: m.content, imageUrl: m.imageUrl || '', createdAt: m.createdAt.toISOString(),
        })),
      });
    }

    // ── Get conversations for a user (patient side — see which doctors messaged them) ──
    if (action === 'get-conversations') {
      const userId = sanitizeId(body.userId);
      if (!userId) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      if (userId !== sessionId) return unauthorized();

      // Find all unique users who have exchanged messages with this user (2 queries)
      const [sent, received] = await Promise.all([
        prisma.doctorMessage.findMany({
          where: { senderId: userId },
          select: { receiverId: true },
          distinct: ['receiverId'],
        }),
        prisma.doctorMessage.findMany({
          where: { receiverId: userId },
          select: { senderId: true },
          distinct: ['senderId'],
        }),
      ]);

      const otherIds = [...new Set([...sent.map(s => s.receiverId), ...received.map(r => r.senderId)])];
      if (otherIds.length === 0) return NextResponse.json({ conversations: [] });

      // Batch: fetch users + all relevant messages in parallel (3 queries total, not N+1)
      const [users, allMessages, unreadCounts] = await Promise.all([
        prisma.user.findMany({
          where: { id: { in: otherIds } },
          select: { id: true, name: true, role: true },
        }),
        // Get recent messages to find the latest per conversation partner
        prisma.doctorMessage.findMany({
          where: {
            OR: [
              { senderId: userId, receiverId: { in: otherIds } },
              { senderId: { in: otherIds }, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
          select: { senderId: true, receiverId: true, content: true, createdAt: true },
          take: otherIds.length * 10,
        }),
        // Get unread counts per sender in a single grouped query (only unread)
        prisma.doctorMessage.groupBy({
          by: ['senderId'],
          where: { receiverId: userId, senderId: { in: otherIds }, read: false },
          _count: { id: true },
        }),
      ]);

      // Build last-message lookup: for each otherUser, find their most recent message
      const lastMessageMap = new Map<string, { content: string; createdAt: Date }>();
      for (const msg of allMessages) {
        const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!lastMessageMap.has(otherId)) {
          lastMessageMap.set(otherId, { content: msg.content, createdAt: msg.createdAt });
        }
      }

      // Build unread count lookup
      const unreadMap = new Map<string, number>();
      for (const g of unreadCounts) {
        unreadMap.set(g.senderId, g._count.id);
      }

      const conversations = users.map(u => {
        const last = lastMessageMap.get(u.id);
        return {
          userId: u.id,
          name: u.name,
          role: u.role,
          lastMessage: last?.content || '',
          lastMessageAt: last?.createdAt.toISOString() || '',
          unreadCount: unreadMap.get(u.id) || 0,
        };
      });

      conversations.sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));

      return NextResponse.json({ conversations });
    }

    // ── Search patients by name or email (doctor side) ──
    if (action === 'search-patients') {
      const doctorId = sanitizeId(body.doctorId);
      if (!doctorId) return NextResponse.json({ error: 'Invalid doctorId' }, { status: 400 });
      if (doctorId !== sessionId) return unauthorized();

      const query = typeof body.query === 'string' ? body.query.trim().slice(0, MAX_STRING) : '';
      if (!query || query.length < 2) return NextResponse.json({ patients: [] });

      const patients = await prisma.user.findMany({
        where: {
          role: 'patient',
          id: { not: doctorId },
          OR: [
            { name: { contains: query } },
            { email: { contains: query } },
          ],
        },
        select: { id: true, name: true, email: true, age: true, gender: true, weight: true, height: true, goal: true },
        take: 10,
      });

      return NextResponse.json({ patients });
    }

    // ── Mark messages as read ──
    if (action === 'mark-read') {
      const userId = sanitizeId(body.userId);
      const senderId = sanitizeId(body.senderId);
      if (!userId || !senderId) return NextResponse.json({ error: 'Invalid userId or senderId' }, { status: 400 });
      if (userId !== sessionId) return unauthorized();

      await prisma.doctorMessage.updateMany({
        where: { senderId, receiverId: userId, read: false },
        data: { read: true },
      });

      return NextResponse.json({ ok: true });
    }

    // ── Get unread message counts per sender (for doctor home page badges) ──
    if (action === 'get-unread-counts') {
      const userId = sanitizeId(body.userId);
      if (!userId) return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
      if (userId !== sessionId) return unauthorized();

      const counts = await prisma.doctorMessage.groupBy({
        by: ['senderId'],
        where: { receiverId: userId, read: false },
        _count: { id: true },
      });

      const unreadCounts: Record<string, number> = {};
      for (const g of counts) {
        unreadCounts[g.senderId] = g._count.id;
      }

      return NextResponse.json({ unreadCounts });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[provider]', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Provider API error' }, { status: 500 });
  }
}
