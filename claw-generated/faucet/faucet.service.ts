import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FaucetService {
  constructor(private prisma: PrismaService) {}

  async dispenseTokens(address: string, ipAddress: string): Promise<{ amount: number }> {
    const lastDispense = await this.prisma.faucetDispense.findFirst({
      where: {
        address,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lastDispense && new Date().getTime() - lastDispense.createdAt.getTime() < 24 * 60 * 60 * 1000) {
      throw new Error('You can only request tokens once per day');
    }

    await this.prisma.faucetDispense.create({
      data: {
        address,
        ipAddress,
        amount: 10,
      },
    });

    // Mint 10 CLAW tokens and send them to the user
    // This is where you would call your token minting logic
    return { amount: 10 };
  }
}