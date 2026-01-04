import { ConfigService } from '@nestjs/config';
import {
  TypeOrmModuleOptions,
  TypeOrmModuleAsyncOptions,
} from '@nestjs/typeorm';

export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
    const logging = configService.get<string>('DATABASE_LOGGING') === 'true';
    const synchronize =
      configService.get<string>('DATABASE_SYNCHRONIZE') === 'true';
    const port = Number(configService.get<string>('DATABASE_PORT'));

    return {
      type: 'postgres',
      logging,
      synchronize,
      migrationsTableName: 'migrations',
      host: configService.getOrThrow<string>('DATABASE_HOST'),
      port,
      database: configService.getOrThrow<string>('DATABASE_NAME'),
      username: configService.getOrThrow<string>('DATABASE_USER'),
      password: configService.getOrThrow<string>('DATABASE_PASSWORD'),
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      entities: [__dirname + '/../**/entities/*.entity{.ts,.js}'],
      subscribers: [__dirname + '/../**/subscribers/*.subscriber{.ts,.js}'],
      autoLoadEntities: true,
    };
  },
  inject: [ConfigService],
};
