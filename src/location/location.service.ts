import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntService } from '../treasure-hunt/treasure-hunt.service';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(TreasureHunt)
    private readonly treasureHuntRepo: Repository<TreasureHunt>,
    private readonly treasureHuntService: TreasureHuntService,
  ) {}

  async create(dto: CreateLocationDto, userId: string) {
    await this.treasureHuntService.ensureOwner(dto.treasureHuntId, userId);

    const hunt = await this.treasureHuntRepo.findOneBy({
      id: dto.treasureHuntId,
    });
    if (!hunt) throw new NotFoundException('Treasure hunt not found');

    const location = this.locationRepo.create({
      ...dto,
      treasureHunt: hunt,
    });
    return this.locationRepo.save(location);
  }

  async findAllForHunt(treasureHuntId: string, userId: string) {
    await this.treasureHuntService.ensureMember(treasureHuntId, userId);
    return this.locationRepo.find({
      where: { treasureHunt: { id: treasureHuntId } },
      order: { order_index: 'ASC' },
    });
  }

  async findOne(locationId: string, userId: string) {
    //?
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['treasureHunt'],
    });
    if (!location) throw new NotFoundException('Location not found');

    await this.treasureHuntService.ensureMember(
      location.treasureHunt.id,
      userId,
    );
    return location;
  }

  async update(locationId: string, dto: UpdateLocationDto, userId: string) {
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['treasureHunt'],
    });
    if (!location) throw new NotFoundException('Location not found');

    await this.treasureHuntService.ensureOwner(
      location.treasureHunt.id,
      userId,
    );

    await this.locationRepo.update(locationId, dto);
    return this.locationRepo.findOneBy({ id: locationId });
  }

  async remove(locationId: string, userId: string) {
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['treasureHunt'],
    });
    if (!location) throw new NotFoundException('Location not found');

    await this.treasureHuntService.ensureOwner(
      location.treasureHunt.id,
      userId,
    );

    await this.locationRepo.delete(locationId);
    return { message: 'Location deleted successfully' };
  }
}
