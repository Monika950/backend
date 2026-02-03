import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from '../../../common/decorators/is-strong-password.decorator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Password123!',
  })
  @IsString()
  @MinLength(8)
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'john_doe',
  })
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    example: 'John',
  })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
  })
  @IsNotEmpty()
  lastName: string;
}
