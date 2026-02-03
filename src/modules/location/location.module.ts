import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHuntModule } from '../treasure-hunt/treasure-hunt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Location, TreasureHunt, TreasureHuntUser, User]),
    TreasureHuntModule,
  ],
  controllers: [LocationController],
  providers: [LocationService],
  exports: [LocationService],
})
export class LocationModule {}
