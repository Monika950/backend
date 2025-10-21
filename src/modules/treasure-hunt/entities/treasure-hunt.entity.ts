import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Location } from '../../location/entities/location.entity';
import { User } from '../../user/entities/user.entity';
import { UserProgress } from '../../user-progress/entities/user-progress.entity';
import { Matches } from 'class-validator';

@Entity()
export class TreasureHunt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => User, (user) => user.treasureHunts)
  user: User[];

  @OneToMany(() => Location, (location) => location.treasureHunt)
  locations: Location[];

  @Column({ unique: true, length: 6 })
  @Matches(/^\d{6}$/, { message: 'Code must be exactly 6 digits' })
  code: string;

  @Column()
  image: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @OneToMany(() => UserProgress, (progress) => progress.treasureHunt)
  progress: UserProgress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
