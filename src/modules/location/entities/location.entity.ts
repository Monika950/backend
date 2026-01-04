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
import { ApiProperty } from '@nestjs/swagger';
import { TreasureHunt } from '../../treasure-hunt/entities/treasure-hunt.entity';
import { UserAnswer } from '../../user-answer/entities/user-answer.entity';

@Entity()
export class Location {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  id: string;

  @ManyToOne(() => TreasureHunt, (treasureHunt) => treasureHunt.locations)
  @IsUUID()
  @ApiProperty({
    description: 'Unique identifier',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  treasureHunt: TreasureHunt;

  @Column({ type: 'jsonb' })
  @IsNotEmpty()
  @IsObject()
  @ApiProperty({
    description: 'Coordinates of the location',
    example: { lat: 42.6975, lng: 23.3242 },
  })
  coordinates: { lat: number; lng: number };

  @Column({ type: 'varchar', length: 100 })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Location name',
    example: 'Alexander Nevsky Cathedral',
  })
  name: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty() //?
  @ApiProperty({
    description: 'Question related to this location',
    example: 'Who is buried here?',
  })
  question: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Hint for answering the question',
    example: 'A major Bulgarian religious leader.',
  })
  hint: string;

  @Column({ type: 'text' })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Correct answer for validation',
    example: 'Hristo Botev',
  })
  correctAnswer: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  @ApiProperty({
    description: 'Relative path or URL of the image',
    example: '/uploads/nevsky.jpg',
  })
  image: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Column({ type: 'int' })
  order_index: number;

  @OneToMany(() => UserAnswer, (answer) => answer.location)
  answers: UserAnswer[];

  @CreateDateColumn()
  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-09T12:00:00.000Z',
  })
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-09T12:30:00.000Z',
  })
  updatedAt: Date;
}
