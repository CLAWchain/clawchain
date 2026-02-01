import { Body, Controller, Post, Req, HttpException, HttpStatus } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { Request } from 'express';

@Controller('faucet')
export class FaucetController {
  constructor(private readonly faucetService: FaucetService) {}

  /**
   * Dispense testnet CLAW tokens to the specified address.
   * @param req - The HTTP request object
   * @param body - An object containing the address to receive the tokens
   * @returns An object indicating whether the request was successful and any error message
   */
  @Post()
  async dispenseTokens(@Req() req: Request, @Body() body: { address: string }) {
    const { address } = body;

    try {
      return await this.faucetService.dispenseTokens(address, req.ip);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}