import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepo: Repository<UserProgress>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(TreasureHunt)
    private readonly huntRepo: Repository<TreasureHunt>,
    @InjectRepository(TreasureHuntUser)
    private readonly huntUserRepo: Repository<TreasureHuntUser>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
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

  private async getFirstLocation(huntId: string): Promise<Location | null> {
    return this.locationRepo.findOne({
      where: { treasureHunt: { id: huntId } },
      order: { order_index: 'ASC' },
    });
  }

  private async findProgress(
    userId: string,
    huntId: string,
    withRelations = false,
  ): Promise<UserProgress | null> {
    return this.progressRepo.findOne({
      where: { user: { id: userId }, treasureHunt: { id: huntId } },
      relations: withRelations
        ? ['currentLocation', 'treasureHunt', 'user']
        : [],
    });
  }

  async startProgress(userId: string, huntId: string) {
    await this.ensureMembership(userId, huntId);

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const hunt = await this.huntRepo.findOne({ where: { id: huntId } });
    if (!hunt) throw new NotFoundException('Treasure hunt not found');

    const existing = await this.findProgress(userId, huntId, true);
    if (existing) {
      return existing;
    }

    const firstLocation = await this.getFirstLocation(huntId);

    const progress = this.progressRepo.create({
      user,
      treasureHunt: hunt,
      currentLocation: firstLocation ?? null,
      currentCoordinates: null,
      completedLocations: [],
      status: 'in_progress',
      completedAt: null,
    });

    return this.progressRepo.save(progress);
  }

  async updatePosition(
    userId: string,
    huntId: string,
    lat: number,
    lng: number,
  ) {
    const progress = await this.findProgress(userId, huntId, true);
    if (!progress) {
      throw new NotFoundException('Progress not found for this user and hunt');
    }

    progress.currentCoordinates = { lat, lng };
    return this.progressRepo.save(progress);
  }

  async completeLocation(userId: string, huntId: string, locationId: string) {
    const progress = await this.findProgress(userId, huntId, true);
    if (!progress) {
      throw new NotFoundException('Progress not found for this user and hunt');
    }

    if (progress.status !== 'in_progress') {
      throw new BadRequestException(`Hunt status is ${progress.status}`);
    }

    const current = progress.currentLocation
      ? await this.locationRepo.findOne({
          where: { id: progress.currentLocation.id },
        })
      : null;

    if (!current) {
      throw new BadRequestException('No current location to complete');
    }

    if (current.id !== locationId) {
      throw new BadRequestException('Location does not match current step');
    }

    if (!progress.completedLocations.includes(current.id)) {
      progress.completedLocations = [
        ...progress.completedLocations,
        current.id,
      ];
    }

    const next = await this.locationRepo.findOne({
      where: {
        treasureHunt: { id: huntId },
        order_index: MoreThan(current.order_index),
      },
      order: { order_index: 'ASC' },
    });

    if (next) {
      progress.currentLocation = next;
    } else {
      progress.currentLocation = null;
      progress.status = 'completed';
      progress.completedAt = new Date();
    }

    const saved = await this.progressRepo.save(progress);

    return {
      status: saved.status,
      currentLocationId: saved.currentLocation
        ? saved.currentLocation.id
        : null,
      completedLocations: saved.completedLocations,
      completedAt: saved.completedAt ?? null,
    };
  }

  async abandon(userId: string, huntId: string) {
    const progress = await this.findProgress(userId, huntId, true);
    if (!progress) {
      throw new NotFoundException('Progress not found for this user and hunt');
    }

    progress.status = 'abandoned';
    progress.completedAt = new Date();
    progress.currentLocation = null;

    return this.progressRepo.save(progress);
  }

  async getProgressForHunt(userId: string, huntId: string) {
    const progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, treasureHunt: { id: huntId } },
      relations: ['currentLocation', 'treasureHunt'],
    });
    if (!progress) {
      throw new NotFoundException('Progress not found for this user and hunt');
    }
    return progress;
  }
}
