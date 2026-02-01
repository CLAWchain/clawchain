import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FaucetRepository {
  constructor(private prisma: PrismaService) {}

  async getLastDispensedForAddress(address: string): Promise<Date | null> {
    const record = await this.prisma.faucetDispense.findFirst({
      where: { address },
      orderBy: { createdAt: 'desc' },
    });
    return record?.createdAt || null;
  }

  async recordDispense(address: string, amount: number): Promise<void> {
    await this.prisma.faucetDispense.create({
      data: { address, amount },
    });
  }
}