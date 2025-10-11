import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../../location/entities/location.entity';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @ManyToOne(() => User, (user) => user.progress)
  user: User;

  @ManyToOne(() => TreasureHunt, (treasureHunt) => treasureHunt.progress)
  treasureHunt: TreasureHunt;

  @ManyToOne(() => Location, { nullable: true })
  currentLocation: Location;

  @Column('jsonb', { nullable: true })
  currentCoordinates: { lat: number; lng: number };

  @Column('int', { array: true, default: [] })
  completedLocations: number[];

  @Column({ default: 'in_progress' })
  status: 'in_progress' | 'completed' | 'abandoned';

  @CreateDateColumn()
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
