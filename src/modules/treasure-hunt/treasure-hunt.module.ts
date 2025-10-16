import { Module } from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { TreasureHuntUser } from './entities/treasure-hunt-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TreasureHunt, TreasureHuntUser, User])],
  controllers: [TreasureHuntController],
  providers: [TreasureHuntService],
})
export class TreasureHuntModule {}
