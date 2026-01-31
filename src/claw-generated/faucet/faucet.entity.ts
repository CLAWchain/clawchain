import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class FaucetDispense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  ip: string;

  @CreateDateColumn()
  createdAt: Date;
}