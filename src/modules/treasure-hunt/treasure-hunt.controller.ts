import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TreasureHuntService } from './treasure-hunt.service';
import { CreateTreasureHuntDto } from './dto/create-treasure-hunt.dto';
import { UpdateTreasureHuntDto } from './dto/update-treasure-hunt.dto';
import { AuthGuard } from '../auth/auth.guard';
import { JoinTreasureHuntDto } from './dto/join-treasure-hunt.dto';

@Controller('treasure-hunt')
export class TreasureHuntController {
  constructor(private readonly treasureHuntService: TreasureHuntService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(@Req() req, @Body() dto: CreateTreasureHuntDto) {
    return this.treasureHuntService.create(dto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Req() req) {
    return this.treasureHuntService.findAllForUser(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req) {
    return this.treasureHuntService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateTreasureHuntDto,
  ) {
    return this.treasureHuntService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req) {
    return this.treasureHuntService.remove(id, req.user.id);
  }

  @Post('join')
  async join(@Req() req, @Body() dto: JoinTreasureHuntDto) {
    return this.treasureHuntService.joinByCode(req.user.id, dto.code);
  }

  @Post(':id/owners/:userId')
  async addOwner(
    @Param('id') id: string,
    @Param('userId') newOwnerId: string,
    @Req() req,
  ) {
    return this.treasureHuntService.addOwner(id, req.user.id, newOwnerId);
  }

  @Get(':id/participants')
  async getParticipants(@Param('id') id: string, @Req() req) {
    return this.treasureHuntService.getParticipants(id, req.user.id);
  }

  @Patch(':id/participants/:userId')
  async changeRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Req() req,
  ) {
    return this.treasureHuntService.changeRole(id, req.user.id, userId, role);
  }
}
