import { PrismaClient } from '@prisma/client';

// Extendemos PrismaClient para asegurar que todos los modelos estén disponibles
const PrismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof PrismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Usamos un singleton para evitar múltiples instancias de Prisma Client
export const prisma = globalForPrisma.prisma ?? PrismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;