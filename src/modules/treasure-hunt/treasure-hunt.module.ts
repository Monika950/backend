import { Module } from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([TreasureHunt])],
  controllers: [TreasureHuntController],
  providers: [TreasureHuntService],
})
export class TreasureHuntModule {}
