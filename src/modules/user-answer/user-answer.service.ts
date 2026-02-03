import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAnswer } from './entities/user-answer.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import {
  TreasureHuntUser,
  TreasureHuntUserRole,
} from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';
import { UserProgressService } from '../user-progress/user-progress.service';
import { UpdateUserAnswerDto } from './dto/update-user-answer.dto';

@Injectable()
export class UserAnswerService {
  constructor(
    @InjectRepository(UserAnswer)
    private readonly answerRepo: Repository<UserAnswer>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TreasureHunt)
    private readonly huntRepo: Repository<TreasureHunt>,
    @InjectRepository(TreasureHuntUser)
    private readonly huntUserRepo: Repository<TreasureHuntUser>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly progressService: UserProgressService,
  ) {}

  // Helpers
  private async ensureMembership(userId: string, huntId: string) {
    const rel = await this.huntUserRepo.findOne({
      where: { user: { id: userId }, treasureHunt: { id: huntId } },
    });
    if (!rel) {
      throw new ForbiddenException('You are not part of this treasure hunt');
    }
    return rel;
  }

  private async ensureOwner(userId: string, huntId: string) {
    const rel = await this.huntUserRepo.findOne({
      where: {
        user: { id: userId },
        treasureHunt: { id: huntId },
        role: TreasureHuntUserRole.OWNER,
      },
    });
    if (!rel) {
      throw new ForbiddenException('Only owners can perform this action');
    }
    return rel;
  }

  private normalize(text: string): string {
    return text.trim().toLowerCase();
  }

  async submitAnswer(userId: string, locationId: string, answer: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['treasureHunt'],
    });
    if (!location) throw new NotFoundException('Location not found');

    const huntId = location.treasureHunt.id;
    await this.ensureMembership(userId, huntId);

    if (!location.correctAnswer) {
      throw new BadRequestException(
        'Location has no correct answer configured',
      );
    }

    const last = await this.answerRepo.findOne({
      where: { user: { id: userId }, location: { id: locationId } },
      order: { attemptNumber: 'DESC' },
    });
    const attemptNumber = last ? last.attemptNumber + 1 : 1;

    const isCorrect =
      this.normalize(answer) === this.normalize(location.correctAnswer);

    const userAnswer = this.answerRepo.create({
      user,
      location,
      treasureHunt: location.treasureHunt,
      answer,
      isCorrect,
      attemptNumber,
    });
    await this.answerRepo.save(userAnswer);

    let progressResult: {
      status: 'in_progress' | 'completed' | 'abandoned';
      currentLocationId: string | null;
      completedLocations: string[];
      completedAt: Date | null;
    } | null = null;

    if (isCorrect) {
      progressResult = await this.progressService.completeLocation(
        userId,
        huntId,
        locationId,
      );
    }

    return {
      isCorrect,
      attemptNumber,
      progress: progressResult,
    };
  }

  async getAnswersForHunt(requestUserId: string, huntId: string) {
    const rel = await this.huntUserRepo.findOne({
      where: { user: { id: requestUserId }, treasureHunt: { id: huntId } },
    });
    if (!rel) {
      throw new ForbiddenException('You are not part of this treasure hunt');
    }

    const whereClause =
      rel.role === TreasureHuntUserRole.OWNER
        ? { treasureHunt: { id: huntId } }
        : { treasureHunt: { id: huntId }, user: { id: requestUserId } };

    return this.answerRepo.find({
      where: whereClause,
      relations: ['location', 'user'],
      order: { answeredAt: 'DESC' },
    });
  }

  async updateAnswer(
    userId: string,
    answerId: string,
    dto: UpdateUserAnswerDto,
  ) {
    if (!dto.answer) {
      throw new BadRequestException('Answer is required');
    }

    const entity = await this.answerRepo.findOne({
      where: { id: answerId },
      relations: ['user', 'location', 'treasureHunt'],
    });
    if (!entity) {
      throw new NotFoundException('Answer not found');
    }
    if (entity.user.id !== userId) {
      throw new ForbiddenException('You can only update your own answers');
    }
    if (dto.locationId && dto.locationId !== entity.location.id) {
      throw new BadRequestException('Location cannot be changed');
    }

    const newIsCorrect =
      this.normalize(dto.answer) ===
      this.normalize(entity.location.correctAnswer ?? '');
    const becameCorrect = !entity.isCorrect && newIsCorrect;

    entity.answer = dto.answer;
    entity.isCorrect = newIsCorrect;
    await this.answerRepo.save(entity);

    if (becameCorrect) {
      await this.progressService.completeLocation(
        userId,
        entity.treasureHunt.id,
        entity.location.id,
      );
    }

    return entity;
  }
}
