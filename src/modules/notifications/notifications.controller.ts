import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ListNotificationsQuery,
  NotificationsService,
  PaginatedNotifications,
} from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

class ReadBatchDto {
  @ApiProperty({
    type: [String],
    example: [
      'a3f0c2e1-1234-4bcd-8f90-abcdef123456',
      'b4f1d2c3-5678-4cde-9f01-bcdef2345678',
    ],
  })
  ids!: string[];
}

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiExtraModels(ApiResponseDto)
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({
    summary: 'List notifications (optional read filter + pagination)',
  })
  @ApiQuery({ name: 'read', required: false, description: 'true | false' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (max 100)',
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
                data: { type: 'array', items: { type: 'object' } },
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' },
              },
            },
          },
        },
      ],
    },
  })
  @Get()
  async list(@Req() req: Request): Promise<PaginatedNotifications> {
    const user = (req as Request & { user?: { id: string } }).user;
    const userId = user?.id;
    const q = req.query as Record<string, string | undefined>;
    const query: ListNotificationsQuery = {
      read:
        typeof q.read === 'string'
          ? q.read.toLowerCase() === 'true'
            ? true
            : q.read.toLowerCase() === 'false'
              ? false
              : undefined
          : undefined,
      page: typeof q.page === 'string' ? Number(q.page) || undefined : undefined,
      limit:
        typeof q.limit === 'string' ? Number(q.limit) || undefined : undefined,
    };

    return this.notificationsService.list(userId, query);
  }

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { type: 'object' } } },
      ],
    },
  })
  @Patch(':id/read')
  async markRead(@Req() req: Request, @Param('id') id: string) {
    const user = (req as Request & { user?: { id: string } }).user;
    const userId = user?.id;
    return this.notificationsService.markRead(userId, id);
  }

  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiBody({ type: ReadBatchDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { updated: { type: 'number' } },
            },
          },
        },
      ],
    },
  })
  @Patch('read-batch')
  async markReadBatch(@Req() req: Request, @Body() dto: ReadBatchDto) {
    const user = (req as Request & { user?: { id: string } }).user;
    const userId = user?.id;
    const updated = await this.notificationsService.markReadBatch(
      userId,
      dto.ids ?? [],
    );
    return { updated };
  }
}
