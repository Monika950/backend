import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max } from 'class-validator';

export class PresignUploadDto {
  @ApiProperty({
    description: 'Upload target type',
    example: 'location',
    enum: ['location', 'hunt'],
  })
  @IsIn(['location', 'hunt'])
  kind: 'location' | 'hunt';

  @ApiProperty({
    description: 'Original filename',
    example: 'photo.jpg',
  })
  @IsString()
  @IsNotEmpty()
  filename: string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 153600,
  })
  @IsInt()
  @Max(2 * 1024 * 1024)
  size: number;
}
