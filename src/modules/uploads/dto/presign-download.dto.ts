import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class PresignDownloadDto {
  @ApiProperty({
    description: 'S3 object key',
    example: 'uploads/locations/123e4567-e89b-12d3-a456-426614174000.jpg',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
