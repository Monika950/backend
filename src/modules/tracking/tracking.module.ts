import { Module } from '@nestjs/common';
import { TrackingGateway } from './tracking.gateway';
import { TreasureHuntModule } from '../treasure-hunt/treasure-hunt.module';
import { UserProgressModule } from '../user-progress/user-progress.module';

@Module({
  imports: [TreasureHuntModule, UserProgressModule],
  providers: [TrackingGateway],
})
export class TrackingModule {}
