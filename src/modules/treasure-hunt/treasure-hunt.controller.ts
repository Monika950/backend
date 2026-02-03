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
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { TreasureHuntDto } from './dto/treasure-hunt.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { UserDto } from '../user/dto/user.dto';
import { AddOwnerDto } from './dto/add-owner.dto';
type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@ApiTags('Treasure Hunt')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto, TreasureHuntDto, UserDto)
@Controller('treasure-hunt')
export class TreasureHuntController {
  constructor(private readonly treasureHuntService: TreasureHuntService) {}

  @UseGuards(AuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new treasure hunt' })
  @ApiBody({ type: CreateTreasureHuntDto })
  @ApiCreatedResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(TreasureHuntDto) } } },
      ],
    },
  })
  async create(@Req() req: AuthedRequest, @Body() dto: CreateTreasureHuntDto) {
    return this.treasureHuntService.create(dto, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'List treasure hunts for current user' })
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
                  role: { type: 'string' },
                  joinedAt: { type: 'string', format: 'date-time' },
                  treasureHunt: { $ref: getSchemaPath(TreasureHuntDto) },
                },
              },
            },
          },
        },
      ],
    },
  })
  async findAll(@Req() req: AuthedRequest) {
    return this.treasureHuntService.findAllForUser(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get treasure hunt by id' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(TreasureHuntDto) } } },
      ],
    },
  })
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.treasureHuntService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update treasure hunt' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiBody({ type: UpdateTreasureHuntDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(TreasureHuntDto) } } },
      ],
    },
  })
  async update(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: UpdateTreasureHuntDto,
  ) {
    return this.treasureHuntService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete treasure hunt' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  async remove(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.treasureHuntService.remove(id, req.user.id);
  }

  @Post('join')
  @ApiOperation({ summary: 'Join treasure hunt by code' })
  @ApiBody({ type: JoinTreasureHuntDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                message: { type: 'string' },
                treasureHuntId: { type: 'string', format: 'uuid' },
              },
            },
          },
        },
      ],
    },
  })
  async join(@Req() req: AuthedRequest, @Body() dto: JoinTreasureHuntDto) {
    return this.treasureHuntService.joinByCode(req.user.id, dto.code);
  }

  @Post(':id/owners/:userId')
  @ApiOperation({ summary: 'Add owner to treasure hunt' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiParam({ name: 'userId', description: 'New owner user ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  async addOwner(
    @Param('id') id: string,
    @Param('userId') newOwnerId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.treasureHuntService.addOwner(id, req.user.id, newOwnerId);
  }

  @Post(':id/owners')
  @ApiOperation({ summary: 'Add owner to treasure hunt (body)' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiBody({ type: AddOwnerDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  async addOwnerByBody(
    @Param('id') id: string,
    @Body() dto: AddOwnerDto,
    @Req() req: AuthedRequest,
  ) {
    return this.treasureHuntService.addOwner(
      id,
      req.user.id,
      dto.newOwnerId,
    );
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'List participants for a treasure hunt' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
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
                  role: { type: 'string' },
                  joinedAt: { type: 'string', format: 'date-time' },
                  user: { $ref: getSchemaPath(UserDto) },
                },
              },
            },
          },
        },
      ],
    },
  })
  async getParticipants(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.treasureHuntService.getParticipants(id, req.user.id);
  }

  @Patch(':id/participants/:userId')
  @ApiOperation({ summary: 'Change participant role' })
  @ApiParam({ name: 'id', description: 'Treasure hunt ID (UUID)' })
  @ApiParam({ name: 'userId', description: 'Participant user ID (UUID)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { role: { type: 'string', example: 'owner' } },
      required: ['role'],
    },
  })
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
                role: { type: 'string' },
                joinedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      ],
    },
  })
  async changeRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body('role') role: string,
    @Req() req: AuthedRequest,
  ) {
    return this.treasureHuntService.changeRole(id, req.user.id, userId, role);
  }
}
