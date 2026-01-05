import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AbandonHuntDto {
  @IsUUID()
  @ApiProperty({
    description: 'Treasure hunt identifier to abandon',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  huntId: string;
}
