import { Body, Controller, Post, Req } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { FaucetRequest } from './faucet.dto';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @Post()
  async dispense(@Body() faucetRequest: FaucetRequest, @Req() req: Request) {
    return this.faucetService.dispenseTokens(faucetRequest.address, req.connection.remoteAddress);
  }
}