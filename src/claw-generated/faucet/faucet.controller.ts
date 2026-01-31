import { Body, Controller, Post, Req } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { FaucetRequest } from './faucet.dto';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private faucetService: FaucetService) {}

  @Post()
  async dispenseTokens(@Req() req: Request, @Body() faucetRequest: FaucetRequest) {
    return this.faucetService.dispenseTokens(req.ip, faucetRequest.address);
  }
}