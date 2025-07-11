import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TreasureHunt {
  @PrimaryGeneratedColumn('uuid')
  id: string;
}
