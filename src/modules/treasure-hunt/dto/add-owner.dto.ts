import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddOwnerDto {
  @ApiProperty({ example: 'dfb7a54b-6db2-4f94-8c83-43c410b6bb59' })
  @IsUUID()
  newOwnerId: string;
}
