import { ApiProperty } from '@nestjs/swagger';

export class TreasureHuntDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a3f0c2e1-1234-4bcd-8f90-abcdef123456',
  })
  id: string;

  @ApiProperty({ example: 'City Center Adventure' })
  name: string;

  @ApiProperty({
    example: 'Find landmarks and solve riddles around the city center',
  })
  description: string;

  @ApiProperty({ example: 'https://example.com/hunt.jpg' })
  image: string;

  @ApiProperty({
    example: '123456',
    description: '6-digit join code',
    minLength: 6,
    maxLength: 6,
  })
  code: string;

  @ApiProperty({ type: String, example: '2026-01-23T10:00:00.000Z' })
  start: Date;

  @ApiProperty({ type: String, example: '2026-01-23T16:00:00.000Z' })
  end: Date;

  @ApiProperty({ type: String, example: '2026-01-23T09:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: String, example: '2026-01-23T09:30:00.000Z' })
  updatedAt: Date;
}
