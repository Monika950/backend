import { PartialType } from '@nestjs/swagger';
import { CreateTreasureHuntDto } from './create-treasure-hunt.dto';

export class UpdateTreasureHuntDto extends PartialType(CreateTreasureHuntDto) {}
