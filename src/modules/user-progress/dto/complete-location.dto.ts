import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteLocationDto {
  @IsUUID()
  @ApiProperty({
    description: 'Treasure hunt identifier',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  huntId: string;

  @IsUUID()
  @ApiProperty({
    description: 'Location identifier to mark as completed',
    example: 'a3f1c9b2-8d74-4f5e-9c1a-2b1e4d5f6a7b',
  })
  locationId: string;
}
