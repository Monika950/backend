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
import { UserAnswerService } from './user-answer.service';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { UpdateUserAnswerDto } from './dto/update-user-answer.dto';
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
import { UserDto } from '../user/dto/user.dto';

type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@ApiTags('User Answers')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto, UserDto)
@Controller('user-answer')
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  @Post()
  @ApiOperation({ summary: 'Submit an answer for a location' })
  @ApiBody({ type: CreateUserAnswerDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                isCorrect: { type: 'boolean' },
                attemptNumber: { type: 'number' },
                progress: {
                  type: 'object',
                  nullable: true,
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
          },
        },
      ],
    },
  })
  async submit(@Req() req: AuthedRequest, @Body() dto: CreateUserAnswerDto) {
    return this.userAnswerService.submitAnswer(
      req.user.id,
      dto.locationId,
      dto.answer,
    );
  }

  // - owner: all participants' answers
  // - participant: only own answers
  @Get('hunt/:huntId')
  @ApiOperation({ summary: 'Get answers for a hunt' })
  @ApiParam({ name: 'huntId', description: 'Treasure hunt ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  answer: { type: 'string' },
                  isCorrect: { type: 'boolean' },
                  attemptNumber: { type: 'number' },
                  answeredAt: { type: 'string', format: 'date-time' },
                  user: { $ref: getSchemaPath(UserDto) },
                  location: { type: 'object' },
                },
              },
            },
          },
        },
      ],
    },
  })
  async getAnswersForHunt(
    @Req() req: AuthedRequest,
    @Param('huntId') huntId: string,
  ) {
    return this.userAnswerService.getAnswersForHunt(req.user.id, huntId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an answer (owner only)' })
  @ApiParam({ name: 'id', description: 'User answer ID (UUID)' })
  @ApiBody({ type: UpdateUserAnswerDto })
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
                answer: { type: 'string' },
                isCorrect: { type: 'boolean' },
                attemptNumber: { type: 'number' },
                answeredAt: { type: 'string', format: 'date-time' },
                user: { $ref: getSchemaPath(UserDto) },
                location: { type: 'object' },
              },
            },
          },
        },
      ],
    },
  })
  async updateAnswer(
    @Req() req: AuthedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserAnswerDto,
  ) {
    return this.userAnswerService.updateAnswer(req.user.id, id, dto);
  }
}
