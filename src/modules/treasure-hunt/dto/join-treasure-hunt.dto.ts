import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinTreasureHuntDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6, { message: 'Code must be exactly 6 digits long' })
  code: string;
}
