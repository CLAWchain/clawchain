import { Body, Controller, Post, Req } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { FaucetRequestDto } from './dto/faucet-request.dto';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private faucetService: FaucetService) {}

  @Post()
  async dispenseTokens(@Req() req: Request, @Body() faucetRequest: FaucetRequestDto) {
    return this.faucetService.dispenseTokens(req, faucetRequest);
  }
}