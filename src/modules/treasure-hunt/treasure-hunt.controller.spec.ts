import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHuntService } from './treasure-hunt.service';

describe('TreasureHuntController', () => {
  let controller: TreasureHuntController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreasureHuntController],
      providers: [TreasureHuntService],
    }).compile();

    controller = module.get<TreasureHuntController>(TreasureHuntController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
