import { ApiProperty } from '@nestjs/swagger';

export class ParticipantLocationDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a3f0c2e1-1234-4bcd-8f90-abcdef123456',
  })
  id: string;

  @ApiProperty({
    example: { lat: 42.6977, lng: 23.3219 },
    description: 'Location coordinates',
  })
  coordinates: { lat: number; lng: number };

  @ApiProperty({ example: 'Central Park' })
  name: string;

  @ApiProperty({ example: 'What year was this landmark built?' })
  question: string;

  @ApiProperty({
    example: 'Look at the plaque near the entrance',
    nullable: true,
  })
  hint: string | null;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    nullable: true,
  })
  image: string | null;

  @ApiProperty({ example: 1 })
  orderIndex: number;

  @ApiProperty({ type: String, example: '2025-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: String, example: '2025-01-02T12:00:00.000Z' })
  updatedAt: Date;
}