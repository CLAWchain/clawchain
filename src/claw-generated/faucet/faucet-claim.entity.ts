import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('faucet_claims')
export class FaucetClaimEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  ip: string;

  @Column()
  claimedAt: Date;
}