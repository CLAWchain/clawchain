import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { FaucetRequestDto } from './dto/faucet-request.dto';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  @Post()
  async requestTokens(@Body() faucetRequest: FaucetRequestDto, @Req() req: Request) {
    return this.faucetService.dispenseTokens(faucetRequest.address, req.ip);
  }
}