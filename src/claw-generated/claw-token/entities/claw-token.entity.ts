import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class ClawToken {
  @PrimaryColumn()
  address: string;

  @Column()
  balance: number;
}