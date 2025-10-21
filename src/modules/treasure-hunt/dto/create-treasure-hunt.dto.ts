import {
  IsString,
  IsOptional,
  IsDateString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateTreasureHuntDto {
  @IsString()
  @Length(3, 100)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: 'Image must be a valid URL' })
  @IsOptional()
  image?: string;

  @IsDateString()
  start: string;

  @IsDateString()
  end: string;
}
