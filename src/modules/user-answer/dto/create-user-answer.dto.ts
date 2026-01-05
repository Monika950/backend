import { IsUUID, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserAnswerDto {
  @IsUUID()
  @ApiProperty({
    description: 'Location identifier being answered',
    example: 'a3f1c9b2-8d74-4f5e-9c1a-2b1e4d5f6a7b',
  })
  locationId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User-provided answer text',
    example: 'Hristo Botev',
  })
  answer: string;
}
