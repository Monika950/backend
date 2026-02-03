import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from 'typeorm';
import { TreasureHunt } from './treasure-hunt.entity';
import { User } from '../../user/entities/user.entity';

export enum TreasureHuntUserRole {
  OWNER = 'owner',
  PARTICIPANT = 'participant',
}

@Unique(['user', 'treasureHunt'])
@Entity()
export class TreasureHuntUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.treasureHuntRoles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TreasureHunt, (hunt) => hunt.user, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'treasure_hunt_id' })
  treasureHunt: TreasureHunt;

  @Column({
    type: 'enum',
    enum: TreasureHuntUserRole,
    default: TreasureHuntUserRole.PARTICIPANT,
  })
  role: TreasureHuntUserRole;

  @CreateDateColumn()
  joinedAt: Date;
}
