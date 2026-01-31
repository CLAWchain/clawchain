import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function recordFaucetRequest(address: string): Promise<void> {
  await prisma.faucetRequest.create({
    data: {
      address,
      requestedAt: new Date(),
    },
  });
}

export async function hasRecentFaucetPayout(address: string): Promise<boolean> {
  const lastRequest = await prisma.faucetRequest.findFirst({
    where: {
      address,
    },
    orderBy: {
      requestedAt: 'desc',
    },
  });

  if (!lastRequest) {
    return false;
  }

  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  const timeSinceLastRequest = new Date().getTime() - lastRequest.requestedAt.getTime();
  return timeSinceLastRequest < oneDay;
}