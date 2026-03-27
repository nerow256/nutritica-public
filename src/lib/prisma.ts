import { PrismaClient } from '@/generated/prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db');

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasourceUrl: `file:${dbPath}`,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown — close DB connections when the process exits
const shutdown = async () => {
  await prisma.$disconnect();
};

process.on('beforeExit', shutdown);
process.on('SIGINT', async () => { await shutdown(); process.exit(0); });
process.on('SIGTERM', async () => { await shutdown(); process.exit(0); });
