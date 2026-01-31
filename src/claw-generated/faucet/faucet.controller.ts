import { Body, Controller, Post, Req } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private faucetService: FaucetService) {}

  @Post()
  async claimTokens(@Req() req: Request, @Body() body: { address: string }) {
    const { address } = body;
    return this.faucetService.claimTokens(address, req.ip);
  }
}