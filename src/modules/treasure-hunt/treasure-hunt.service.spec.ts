import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntService } from './treasure-hunt.service';

describe('TreasureHuntService', () => {
  let service: TreasureHuntService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TreasureHuntService],
    }).compile();

    service = module.get<TreasureHuntService>(TreasureHuntService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
