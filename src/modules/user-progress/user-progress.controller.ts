import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserProgressService } from './user-progress.service';
import { StartHuntDto } from './dto/start-hunt.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { CompleteLocationDto } from './dto/complete-location.dto';
import { AbandonHuntDto } from './dto/abandon-hunt.dto';
import { AuthGuard } from '../auth/auth.guard';

type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post('start')
  async start(@Req() req: AuthedRequest, @Body() dto: StartHuntDto) {
    return this.userProgressService.startProgress(req.user.id, dto.huntId);
  }

  @Patch('update-position')
  async updatePosition(
    @Req() req: AuthedRequest,
    @Body() dto: UpdatePositionDto,
  ) {
    return this.userProgressService.updatePosition(
      req.user.id,
      dto.huntId,
      dto.lat,
      dto.lng,
    );
  }

  @Patch('complete-location')
  async completeLocation(
    @Req() req: AuthedRequest,
    @Body() dto: CompleteLocationDto,
  ) {
    return this.userProgressService.completeLocation(
      req.user.id,
      dto.huntId,
      dto.locationId,
    );
  }

  @Patch('abandon')
  async abandon(@Req() req: AuthedRequest, @Body() dto: AbandonHuntDto) {
    return this.userProgressService.abandon(req.user.id, dto.huntId);
  }

  @Get(':huntId')
  async getProgress(
    @Req() req: AuthedRequest,
    @Param('huntId') huntId: string,
  ) {
    return this.userProgressService.getProgressForHunt(req.user.id, huntId);
  }
}
