import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTreasureHuntDto } from './dto/create-treasure-hunt.dto';
import { UpdateTreasureHuntDto } from './dto/update-treasure-hunt.dto';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import {
  TreasureHuntUser,
  TreasureHuntUserRole,
} from './entities/treasure-hunt-user.entity';

@Injectable()
export class TreasureHuntService {
  constructor(
    @InjectRepository(TreasureHunt)
    private readonly treasureHuntRepo: Repository<TreasureHunt>,
    @InjectRepository(TreasureHuntUser)
    private readonly huntUserRepo: Repository<TreasureHuntUser>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(
    dto: CreateTreasureHuntDto,
    userId: string,
  ): Promise<TreasureHunt> {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const treasureHunt = this.treasureHuntRepo.create({
      ...dto,
      code,
    });

    const savedHunt = await this.treasureHuntRepo.save(treasureHunt);

    const huntUser = this.huntUserRepo.create({
      user,
      treasureHunt: savedHunt,
      role: TreasureHuntUserRole.OWNER,
    });
    await this.huntUserRepo.save(huntUser);

    return savedHunt;
  }

  async findAllForUser(userId: string) {
    return this.huntUserRepo.find({
      where: { user: { id: userId } },
      relations: ['treasureHunt'],
    });
  }

  async findOne(huntId: string, userId: string) {
    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id: huntId }, user: { id: userId } },
      relations: ['treasureHunt'],
    });
    if (!relation)
      throw new ForbiddenException('Not part of this treasure hunt');
    return relation.treasureHunt;
  }

  async update(huntId: string, userId: string, dto: UpdateTreasureHuntDto) {
    await this.ensureOwner(huntId, userId);
    await this.treasureHuntRepo.update(huntId, dto);
    return this.treasureHuntRepo.findOneBy({ id: huntId });
  }

  async remove(huntId: string, userId: string) {
    await this.ensureOwner(huntId, userId);
    await this.treasureHuntRepo.delete(huntId);
    return { message: 'Treasure hunt deleted successfully' };
  }

  async joinByCode(userId: string, code: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new NotFoundException('User not found');

    const treasureHunt = await this.treasureHuntRepo.findOneBy({ code });
    if (!treasureHunt)
      throw new NotFoundException('Invalid code or treasure hunt not found');

    const existing = await this.huntUserRepo.findOne({
      where: { user: { id: userId }, treasureHunt: { id: treasureHunt.id } },
    });
    if (existing)
      throw new BadRequestException('Already joined this treasure hunt');

    const relation = this.huntUserRepo.create({
      user,
      treasureHunt,
      role: TreasureHuntUserRole.PARTICIPANT,
    });

    await this.huntUserRepo.save(relation);

    return {
      message: 'Successfully joined the treasure hunt',
      treasureHuntId: treasureHunt.id,
    };
  }

  async addOwner(huntId: string, requestUserId: string, newOwnerId: string) {
    await this.ensureOwner(huntId, requestUserId);

    const newOwner = await this.userRepo.findOneBy({ id: newOwnerId });
    if (!newOwner) throw new NotFoundException('User not found');

    const hunt = await this.treasureHuntRepo.findOneBy({ id: huntId });
    await this.huntUserRepo.save({
      user: newOwner,
      treasureHunt: hunt,
      role: TreasureHuntUserRole.OWNER,
    });

    return { message: 'Owner added successfully' };
  }

  async getParticipants(huntId: string, requestUserId: string) {
    await this.ensureMember(huntId, requestUserId);
    return this.huntUserRepo.find({
      where: { treasureHunt: { id: huntId } },
      relations: ['user'],
    });
  }

  async changeRole(
    huntId: string,
    requestUserId: string,
    targetUserId: string,
    role: string,
  ) {
    await this.ensureOwner(huntId, requestUserId);

    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id: huntId }, user: { id: targetUserId } },
    });

    if (!relation) throw new NotFoundException('User not part of this hunt');
    relation.role = role as TreasureHuntUserRole; //dto
    return this.huntUserRepo.save(relation);
  }

  async ensureOwner(huntId: string, userId: string) {
    const relation = await this.huntUserRepo.findOne({
      where: {
        treasureHunt: { id: huntId },
        user: { id: userId },
        role: TreasureHuntUserRole.OWNER,
      },
    });
    if (!relation)
      throw new ForbiddenException('Only owners can perform this action');
  }

  async ensureMember(huntId: string, userId: string) {
    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id: huntId }, user: { id: userId } },
    });
    if (!relation)
      throw new ForbiddenException('You are not part of this treasure hunt');
  }
}
