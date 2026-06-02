import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntService } from '../treasure-hunt/treasure-hunt.service';
import { ParticipantLocationDto } from './dto/participant-location.dto';
import { LocationDto } from './dto/location.dto';

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
      treasureHunt: hunt,
      coordinates: dto.coordinates,
      name: dto.name,
      question: dto.question,
      correctAnswer: dto.correctAnswer,
      hint: dto.hint,
      image: dto.image,
      orderIndex: dto.orderIndex,
    });
    return this.locationRepo.save(location);
  }

  async findAllForHunt(
    treasureHuntId: string,
    userId: string,
  ): Promise<LocationDto[] | ParticipantLocationDto[]> {
    await this.treasureHuntService.ensureMember(treasureHuntId, userId);

    const locations = await this.locationRepo.find({
      where: { treasureHunt: { id: treasureHuntId } },
      order: { orderIndex: 'ASC' },
    });

    const isOwner = await this.treasureHuntService.isOwner(
      treasureHuntId,
      userId,
    );

    if (isOwner) {
      return locations;
    }

    return locations.map((location) => {
      const { correctAnswer, ...participantData } = location;
      return participantData as ParticipantLocationDto;
    });
  }

  async findOne(
    locationId: string,
    userId: string,
  ): Promise<LocationDto | ParticipantLocationDto> {
    const location = await this.locationRepo.findOne({
      where: { id: locationId },
      relations: ['treasureHunt'],
    });
    if (!location) throw new NotFoundException('Location not found');

    await this.treasureHuntService.ensureMember(
      location.treasureHunt.id,
      userId,
    );

    const isOwner = await this.treasureHuntService.isOwner(
      location.treasureHunt.id,
      userId,
    );

    if (isOwner) {
      return location;
    }

    const { correctAnswer, ...participantData } = location;
    return participantData as ParticipantLocationDto;
  }

  async update(locationId: string, dto: UpdateLocationDto, userId: string) {
    if ('treasureHuntId' in dto) {
      throw new BadRequestException('treasureHuntId cannot be updated');
    }
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
