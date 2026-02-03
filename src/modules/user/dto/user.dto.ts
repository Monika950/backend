import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    format: 'uuid',
    example: 'a3f0c2e1-1234-4bcd-8f90-abcdef123456',
  })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ type: String, example: '2025-01-01T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ type: String, example: '2025-01-02T12:00:00.000Z' })
  updatedAt: Date;
}
