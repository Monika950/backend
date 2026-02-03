import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'Password123!' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ example: 'StrongerPass123!' })
  @IsStrongPassword()
  newPassword: string;
}
