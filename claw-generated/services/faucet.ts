import { prisma } from './prisma';

export async function recordDispensed(address: string) {
  await prisma.faucetDispense.create({
    data: {
      address,
      dispensedAt: new Date(),
    },
  });
}

export async function checkAddressLimit(address: string) {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.faucetDispense.count({
    where: {
      address,
      dispensedAt: {
        gte: yesterday,
      },
    },
  });
  return count >= 1;
}