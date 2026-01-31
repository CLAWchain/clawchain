import { IsString } from 'class-validator';

export class FaucetRequest {
  @IsString()
  address: string;
}