export class CreateTreasureHuntDto {
  name: string;

  description?: string;

  owners: string[];

  users?: string[];

  locations?: string[]; //?

  start: Date;

  end?: Date;
}
