import { Test, TestingModule } from '@nestjs/testing';
import { LocationService } from './location.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntService } from '../treasure-hunt/treasure-hunt.service';

describe('LocationService', () => {
  let service: LocationService;
  const locationRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const huntRepo = { findOneBy: jest.fn() };
  const huntService = { ensureOwner: jest.fn(), ensureMember: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocationService,
        { provide: getRepositoryToken(Location), useValue: locationRepo },
        { provide: getRepositoryToken(TreasureHunt), useValue: huntRepo },
        { provide: TreasureHuntService, useValue: huntService },
      ],
    }).compile();

    service = module.get<LocationService>(LocationService);
    jest.clearAllMocks();
  });

  it('create saves a location for a hunt', async () => {
    huntService.ensureOwner.mockResolvedValue(undefined);
    huntRepo.findOneBy.mockResolvedValue({ id: 'h1' });
    locationRepo.create.mockReturnValue({ id: 'l1' });
    locationRepo.save.mockResolvedValue({ id: 'l1' });

    const result = await service.create(
      {
        treasureHuntId: 'h1',
        coordinates: { lat: 1, lng: 2 },
        name: 'L',
        question: 'Q',
        correctAnswer: 'A',
        hint: 'H',
        orderIndex: 1,
      } as any,
      'u1',
    );

    expect(result).toEqual({ id: 'l1' });
    expect(locationRepo.create).toHaveBeenCalled();
    expect(locationRepo.save).toHaveBeenCalled();
  });
});
