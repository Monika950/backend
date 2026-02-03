import { ApiProperty } from '@nestjs/swagger';

export class SafeUserDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a3f0c2e1-1234-4bcd-8f90-abcdef123456',
  })
  id: string;

  @ApiProperty({
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  email: string;
}

export class AuthResponseDto extends SafeUserDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}
