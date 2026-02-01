import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FaucetRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column()
  ip: string;

  @Column()
  requestDate: string;
}