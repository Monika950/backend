import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsString, IsOptional } from 'class-validator';
// import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email', 'password'] as const),
) {
  //   @IsOptional()
  //   @IsString()
  //   @IsStrongPassword()
  //   password?: string;

  @ApiPropertyOptional({ example: 'john_doe' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;
}
