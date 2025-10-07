import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../../location/entities/location.entity';

@Entity()
export class TreasureHunt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column('uuid', { array: true })
  owners: string[];

  @Column('uuid', { array: true })
  users: string[];

  @OneToMany(() => Location, (location) => location.treasureHuntId)
  locations: Location[];

  @Column({ unique: true })
  code: string;

  @Column()
  image: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
