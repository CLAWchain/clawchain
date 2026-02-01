import { Body, Controller, Post, Req } from '@nestjs/common';
import { FaucetRequestDto } from './dto/faucet-request.dto';
import { FaucetService } from './faucet.service';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private faucetService: FaucetService) {}

  @Post()
  async dispenseTokens(@Req() req: Request, @Body() faucetRequest: FaucetRequestDto) {
    return this.faucetService.dispenseTokens(req, faucetRequest);
  }
}