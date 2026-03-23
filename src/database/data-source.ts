import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';

dotenv.config();

const connectDB = new DataSource({
  type: 'postgres',
  logging: process.env.DATABASE_LOGGING === 'true',
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  host: process.env.DATABASE_HOST,
  port: +process.env.DATABASE_PORT,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [__dirname + '/../**/entities/*.entity{.ts,.js}', User],
});

export default connectDB;
