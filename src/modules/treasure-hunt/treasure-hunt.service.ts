import {
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

  async findOne(id: string, userId: string) {
    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id }, user: { id: userId } },
      relations: ['treasureHunt'],
    });
    if (!relation)
      throw new ForbiddenException('Not part of this treasure hunt');
    return relation.treasureHunt;
  }

  async update(id: string, userId: string, dto: UpdateTreasureHuntDto) {
    await this.ensureOwner(id, userId);
    await this.treasureHuntRepo.update(id, dto);
    return this.treasureHuntRepo.findOneBy({ id });
  }

  async remove(id: string, userId: string) {
    await this.ensureOwner(id, userId);
    await this.treasureHuntRepo.delete(id);
    return { message: 'Treasure hunt deleted successfully' };
  }

  async addOwner(id: string, requestUserId: string, newOwnerId: string) {
    await this.ensureOwner(id, requestUserId);

    const newOwner = await this.userRepo.findOneBy({ id: newOwnerId });
    if (!newOwner) throw new NotFoundException('User not found');

    const hunt = await this.treasureHuntRepo.findOneBy({ id: id });
    await this.huntUserRepo.save({
      user: newOwner,
      treasureHunt: hunt,
      role: TreasureHuntUserRole.OWNER,
    });

    return { message: 'Owner added successfully' };
  }

  async getParticipants(id: string, requestUserId: string) {
    await this.ensureMember(id, requestUserId);
    return this.huntUserRepo.find({
      where: { treasureHunt: { id: id } },
      relations: ['user'],
    });
  }

  async changeRole(
    id: string,
    requestUserId: string,
    targetUserId: string,
    role: string,
  ) {
    await this.ensureOwner(id, requestUserId);

    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id: id }, user: { id: targetUserId } },
    });

    if (!relation) throw new NotFoundException('User not part of this hunt');
    relation.role = role as TreasureHuntUserRole; //dto
    return this.huntUserRepo.save(relation);
  }

  private async ensureOwner(huntId: string, userId: string) {
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

  private async ensureMember(huntId: string, userId: string) {
    const relation = await this.huntUserRepo.findOne({
      where: { treasureHunt: { id: huntId }, user: { id: userId } },
    });
    if (!relation)
      throw new ForbiddenException('You are not part of this treasure hunt');
  }
}
