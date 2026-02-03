import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsUUID,
  IsUrl,
  IsInt,
  Min,
} from 'class-validator';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';
import { UserAnswer } from '../../user-answer/entities/user-answer.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @ManyToOne(() => TreasureHunt, (treasureHunt) => treasureHunt.locations, {
    onDelete: 'CASCADE',
  })
  treasureHunt: TreasureHunt;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsObject()
  coordinates: { lat: number; lng: number };

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @Column({ type: 'text', nullable: true })
  @IsString()
  //   @IsNotEmpty()
  hint: string | null;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  correctAnswer: string;

  @Column({ nullable: true })
  @IsString()
  //   @IsNotEmpty()
  @IsUrl()
  image: string | null;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Column({ type: 'int', name: 'order_index' })
  orderIndex: number;

  @OneToMany(() => UserAnswer, (answer) => answer.location)
  answers: UserAnswer[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
