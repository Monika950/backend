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
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@ApiTags('User Progress')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto)
@Controller('user-progress')
export class UserProgressController {
  constructor(private readonly userProgressService: UserProgressService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start progress for a treasure hunt' })
  @ApiBody({ type: StartHuntDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: { type: 'string' },
                currentCoordinates: { type: 'object' },
                completedLocations: {
                  type: 'array',
                  items: { type: 'string' },
                },
                startedAt: { type: 'string', format: 'date-time' },
                completedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  async start(@Req() req: AuthedRequest, @Body() dto: StartHuntDto) {
    return this.userProgressService.startProgress(req.user.id, dto.huntId);
  }

  @Patch('update-position')
  @ApiOperation({ summary: 'Update current user position' })
  @ApiBody({ type: UpdatePositionDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                currentCoordinates: { type: 'object' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
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
  @ApiOperation({ summary: 'Complete current location' })
  @ApiBody({ type: CompleteLocationDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                currentLocationId: {
                  type: 'string',
                  format: 'uuid',
                  nullable: true,
                },
                completedLocations: {
                  type: 'array',
                  items: { type: 'string' },
                },
                completedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
              },
            },
          },
        },
      ],
    },
  })
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
  @ApiOperation({ summary: 'Abandon treasure hunt' })
  @ApiBody({ type: AbandonHuntDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: { type: 'string' },
                completedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  async abandon(@Req() req: AuthedRequest, @Body() dto: AbandonHuntDto) {
    return this.userProgressService.abandon(req.user.id, dto.huntId);
  }

  @Get(':huntId/user/:userId')
  @ApiOperation({
    summary: 'Get a participant progress for a treasure hunt (owner only)',
  })
  @ApiParam({ name: 'huntId', description: 'Treasure hunt ID (UUID)' })
  @ApiParam({ name: 'userId', description: 'Participant user ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: { type: 'string' },
                currentCoordinates: { type: 'object' },
                completedLocations: {
                  type: 'array',
                  items: { type: 'string' },
                },
                startedAt: { type: 'string', format: 'date-time' },
                completedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  async getParticipantProgress(
    @Req() req: AuthedRequest,
    @Param('huntId') huntId: string,
    @Param('userId') userId: string,
  ) {
    return this.userProgressService.getParticipantProgressForHunt(
      req.user.id,
      huntId,
      userId,
    );
  }

  @Get(':huntId')
  @ApiOperation({ summary: 'Get progress for a treasure hunt' })
  @ApiParam({ name: 'huntId', description: 'Treasure hunt ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                status: { type: 'string' },
                currentCoordinates: { type: 'object' },
                completedLocations: {
                  type: 'array',
                  items: { type: 'string' },
                },
                startedAt: { type: 'string', format: 'date-time' },
                completedAt: {
                  type: 'string',
                  format: 'date-time',
                  nullable: true,
                },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  async getProgress(
    @Req() req: AuthedRequest,
    @Param('huntId') huntId: string,
  ) {
    return this.userProgressService.getProgressForHunt(req.user.id, huntId);
  }
}
