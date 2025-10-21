import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Location } from './entities/location.entity';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({ status: 201, description: 'Location created', type: Location })
  async create(@Req() req, @Body() dto: CreateLocationDto) {
    return this.locationService.create(dto, req.user.id);
  }

  @Get('/hunt/:treasureHuntId')
  async findAllForHunt(
    @Param('treasureHuntId') treasureHuntId: string,
    @Req() req,
  ) {
    return this.locationService.findAllForHunt(treasureHuntId, req.user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.locationService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.locationService.remove(id, req.user.id);
  }
}
