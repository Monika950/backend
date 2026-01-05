import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgressService } from './user-progress.service';
import { UserProgressController } from './user-progress.controller';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserProgress,
      User,
      TreasureHunt,
      TreasureHuntUser,
      Location,
    ]),
  ],
  controllers: [UserProgressController],
  providers: [UserProgressService],
  exports: [UserProgressService],
})
export class UserProgressModule {}
