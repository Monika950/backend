import { IsString, IsOptional, IsUrl, Length, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTreasureHuntDto {
  @ApiProperty({
    minLength: 3,
    maxLength: 100,
    example: 'City Center Adventure',
    description: 'Name of the treasure hunt',
  })
  @IsString()
  @Length(3, 100)
  name: string;

  @ApiProperty({
    example: 'Find landmarks and solve riddles around the city center',
    description: 'Description of the treasure hunt',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    example: 'https://example.com/hunt.jpg',
    description: 'Optional image URL for the hunt',
  })
  @IsUrl({}, { message: 'Image must be a valid URL' })
  @IsOptional()
  image?: string;

  @ApiProperty({
    example: '2026-01-23T10:00:00.000Z',
    description: 'ISO date string for hunt start time',
  })
  @Type(() => Date)
  @IsDate()
  start: Date;

  @ApiProperty({
    example: '2026-01-23T16:00:00.000Z',
    description: 'ISO date string for hunt end time',
  })
  @Type(() => Date)
  @IsDate()
  end: Date;
}
