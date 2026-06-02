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
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { LocationDto } from './dto/location.dto';
import { ParticipantLocationDto } from './dto/participant-location.dto';
type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@ApiTags('Locations')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto, LocationDto, ParticipantLocationDto)
@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new location' })
  @ApiBody({ type: CreateLocationDto })
  @ApiResponse({
    status: 201,
    description: 'Location created',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'object' } } },
      ],
    },
  })
  async create(@Req() req: AuthedRequest, @Body() dto: CreateLocationDto) {
    return this.locationService.create(dto, req.user.id);
  }

  @Get('/hunt/:treasureHuntId')
  @ApiOperation({
    summary: 'List locations for a treasure hunt',
    description:
      'Returns full location data (including correct answers) for treasure hunt owners, and filtered data (without correct answers) for participants',
  })
  @ApiParam({
    name: 'treasureHuntId',
    description: 'Treasure hunt ID (UUID)',
  })
  @ApiOkResponse({
    description:
      'Array of locations. Owners receive LocationDto (with correctAnswer), participants receive ParticipantLocationDto (without correctAnswer)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: {
                oneOf: [
                  { $ref: getSchemaPath(LocationDto) },
                  { $ref: getSchemaPath(ParticipantLocationDto) },
                ],
              },
            },
          },
        },
      ],
    },
  })
  async findAllForHunt(
    @Param('treasureHuntId') treasureHuntId: string,
    @Req() req: AuthedRequest,
  ) {
    return this.locationService.findAllForHunt(treasureHuntId, req.user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get location by id',
    description:
      'Returns full location data (including correct answer) for treasure hunt owners, and filtered data (without correct answer) for participants',
  })
  @ApiParam({ name: 'id', description: 'Location ID (UUID)' })
  @ApiOkResponse({
    description:
      'Location data. Owners receive LocationDto (with correctAnswer), participants receive ParticipantLocationDto (without correctAnswer)',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              oneOf: [
                { $ref: getSchemaPath(LocationDto) },
                { $ref: getSchemaPath(ParticipantLocationDto) },
              ],
            },
          },
        },
      ],
    },
  })
  async findOne(@Param('id') id: string, @Req() req: AuthedRequest) {
    return this.locationService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update location' })
  @ApiParam({ name: 'id', description: 'Location ID (UUID)' })
  @ApiBody({ type: UpdateLocationDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'object' } } },
      ],
    },
  })
  async update(
    @Param('id') id: string,
    @Req() req: AuthedRequest,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationService.update(id, dto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete location' })
  @ApiParam({ name: 'id', description: 'Location ID (UUID)' })
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
    return this.locationService.remove(id, req.user.id);
  }
}
