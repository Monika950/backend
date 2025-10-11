import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';
import { UserProgress } from '../../user-progress/entities/user-progress.entity';
import { UserAnswer } from '../../user-answer/entities/user-answer.entity';
import { TreasureHuntUser } from '../../treasure-hunt/entities/treasure-hunt-user.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ unique: true })
  username: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  refreshToken?: string | null;

  @OneToMany(() => TreasureHunt, (treasureHunt) => treasureHunt.user)
  treasureHunts: TreasureHunt[];

  @OneToMany(() => TreasureHuntUser, (thu) => thu.user)
  treasureHuntRoles: TreasureHuntUser[];

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => UserAnswer, (answer) => answer.user)
  answers: UserAnswer[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }
  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
