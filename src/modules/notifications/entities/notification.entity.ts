import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';

export enum NotificationType {
  HUNT_JOINED = 'hunt_joined',
  HUNT_STARTED = 'hunt_started',
  HUNT_COMPLETED = 'hunt_completed',
  HUNT_ABANDONED = 'hunt_abandoned',
}

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column('uuid')
  userId!: string;

  @ManyToOne(() => TreasureHunt, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'huntId' })
  hunt?: TreasureHunt | null;

  @Column('uuid', { nullable: true })
  huntId?: string | null;

  @Column({ type: 'varchar', length: 100 })
  type!: string;

  @Column('jsonb', { nullable: true })
  payload?: Record<string, unknown> | null;

  @Column({ type: 'timestamptz', nullable: true })
  readAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}
