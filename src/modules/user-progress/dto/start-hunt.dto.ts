import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartHuntDto {
  @IsUUID()
  @ApiProperty({
    description:
      'Treasure hunt identifier to start progress for the current user',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  huntId: string;
}
