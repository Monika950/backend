import { Injectable } from '@nestjs/common';
import { CreateTreasureHuntDto } from './dto/create-treasure-hunt.dto';
import { UpdateTreasureHuntDto } from './dto/update-treasure-hunt.dto';

@Injectable()
export class TreasureHuntService {
  create(createTreasureHuntDto: CreateTreasureHuntDto) {
    return 'This action adds a new treasureHunt';
  }

  findAll() {
    return `This action returns all treasureHunt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} treasureHunt`;
  }

  update(id: number, updateTreasureHuntDto: UpdateTreasureHuntDto) {
    return `This action updates a #${id} treasureHunt`;
  }

  remove(id: number) {
    return `This action removes a #${id} treasureHunt`;
  }
}
