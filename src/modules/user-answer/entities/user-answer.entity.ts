import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Location } from '../../../location/entities/location.entity';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';
import { User } from '../../user/entities/user.entity';

@Unique(['user', 'location', 'attemptNumber'])
@Entity()
export class UserAnswer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.answers)
  user: User;

  @ManyToOne(() => Location, (location) => location.answers)
  location: Location;

  @ManyToOne(() => TreasureHunt)
  treasureHunt: TreasureHunt;

  @Column({ type: 'text' })
  answer: string;

  @Column({ default: false })
  isCorrect: boolean;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number;

  @CreateDateColumn()
  answeredAt: Date;
}
