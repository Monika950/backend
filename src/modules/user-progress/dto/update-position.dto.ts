import { IsUUID, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePositionDto {
  @IsUUID()
  @ApiProperty({
    description:
      'Treasure hunt identifier for which to update current position',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  huntId: string;

  @IsNumber()
  @ApiProperty({
    description: 'Latitude of the current user position',
    example: 42.6975,
  })
  lat: number;

  @IsNumber()
  @ApiProperty({
    description: 'Longitude of the current user position',
    example: 23.3242,
  })
  lng: number;
}
