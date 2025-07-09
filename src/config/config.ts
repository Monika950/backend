import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleOptions,
  TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'postgres',
    logging: configService.get<string>('DATABASE_LOGGING') === 'true',
    synchronize: configService.getOrThrow<boolean>('DATABASE_SYNCHRONIZE'),
    migrationsTableName: 'migrations',
    host: configService.getOrThrow<string>('DATABASE_HOST'),
    port: configService.getOrThrow<number>('DATABASE_PORT'),
    database: configService.getOrThrow<string>('DATABASE_NAME'),
    username: configService.getOrThrow<string>('DATABASE_USER'),
    password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
    migrations: [__dirname + '/../migrations/*{.ts,.js}'],
    entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
    subscribers: [__dirname + '/../**/subscribers/*.subscriber{.ts,.js}'],
    autoLoadEntities: true,
  }),
  inject: [ConfigService],
};