import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'stamsoft',
  synchronize: true, //false
  logging: false,
  //entities: [User],
  migrations: [],
  subscribers: [],
});
