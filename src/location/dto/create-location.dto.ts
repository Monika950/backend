import {
  IsString,
  IsNotEmpty,
  IsObject,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @IsObject()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Coordinates of the location',
    example: { lat: 42.6975, lng: 23.3242 },
  })
  coordinates: { lat: number; lng: number };

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Location name',
    example: 'Alexander Nevsky Cathedral',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Question related to this location',
    example: 'Who is buried here?',
  })
  question: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Hint for answering the question',
    example: 'A major Bulgarian religious leader.',
  })
  hint?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image must be a valid URL or relative path' })
  @ApiPropertyOptional({
    description: 'URL or relative path of the image',
    example: '/uploads/nevsky.jpg',
  })
  image?: string;
}
