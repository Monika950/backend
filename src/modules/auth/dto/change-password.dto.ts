import { IsString, IsUUID } from 'class-validator';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsStrongPassword()
  newPassword: string;
}
