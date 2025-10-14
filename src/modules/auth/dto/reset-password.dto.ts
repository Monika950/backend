import { IsString } from 'class-validator';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsStrongPassword()
  newPassword: string;
}
