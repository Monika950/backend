import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAnswerService } from './user-answer.service';
import { UserAnswerController } from './user-answer.controller';
import { UserAnswer } from './entities/user-answer.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';
import { UserProgressModule } from '../user-progress/user-progress.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserAnswer,
      User,
      TreasureHunt,
      TreasureHuntUser,
      Location,
    ]),
    UserProgressModule,
  ],
  controllers: [UserAnswerController],
  providers: [UserAnswerService],
})
export class UserAnswerModule {}
