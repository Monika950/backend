import { Module } from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { TreasureHuntController } from './treasure-hunt.controller';

@Module({
  controllers: [TreasureHuntController],
  providers: [TreasureHuntService],
})
export class TreasureHuntModule {}
