import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinRoomDto {
  @ApiProperty({
    format: 'uuid',
    example: 'de305d54-75b4-431b-adb2-eb6b9e546014',
  })
  @IsUUID()
  huntId!: string;
}
