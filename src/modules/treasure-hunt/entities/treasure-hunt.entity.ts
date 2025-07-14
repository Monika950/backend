import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TreasureHunt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { array: true })
  owners: string[];

  @Column('uuid', { array: true }) 
  users: string[];

  @Column('uuid', { array: true })
  locations: string[];

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
