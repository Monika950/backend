import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { CreateTreasureHuntDto } from './dto/create-treasure-hunt.dto';
import { UpdateTreasureHuntDto } from './dto/update-treasure-hunt.dto';

@Controller('treasure-hunt')
export class TreasureHuntController {
  constructor(private readonly treasureHuntService: TreasureHuntService) {}

  @Post()
  create(@Body() createTreasureHuntDto: CreateTreasureHuntDto) {
    return this.treasureHuntService.create(createTreasureHuntDto);
  }

  @Get()
  findAll() {
    return this.treasureHuntService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treasureHuntService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTreasureHuntDto: UpdateTreasureHuntDto) {
    return this.treasureHuntService.update(+id, updateTreasureHuntDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treasureHuntService.remove(+id);
  }
}
