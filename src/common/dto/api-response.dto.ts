import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto {
  @ApiProperty({ example: 'success' })
  status: string;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ description: 'Response payload' })
  data: unknown;

  @ApiProperty({ example: '2026-01-29T12:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '/api/example' })
  path: string;
}
