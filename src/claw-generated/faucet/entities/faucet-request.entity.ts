import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class FaucetRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  ipAddress: string;

  @CreateDateColumn()
  requestedAt: Date;
}