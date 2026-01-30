import { IsNumber, IsUUID, IsOptional, IsISO8601 } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PositionUpdateDto {
  @ApiProperty({
    format: 'uuid',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  @IsUUID()
  huntId!: string;

  @ApiProperty({ example: 42.6975 })
  @IsNumber()
  lat!: number;

  @ApiProperty({ example: 23.3242 })
  @IsNumber()
  lng!: number;

  @ApiPropertyOptional({
    example: '2026-01-23T10:00:00.000Z',
    description: 'ISO timestamp for the position update',
  })
  @IsOptional()
  @IsISO8601()
  ts?: string;
}
