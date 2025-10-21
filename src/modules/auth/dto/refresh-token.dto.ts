import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class RefreshTokenDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  refreshToken: string;
}
