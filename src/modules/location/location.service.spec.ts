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
  const huntService = {
    ensureOwner: jest.fn(),
    ensureMember: jest.fn(),
    isOwner: jest.fn(),
  };

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

  it('findAllForHunt returns full data for owners', async () => {
    huntService.ensureMember.mockResolvedValue(undefined);
    huntService.isOwner.mockResolvedValue(true);
    const locations = [
      {
        id: 'l1',
        name: 'Location 1',
        correctAnswer: 'Answer 1',
        orderIndex: 1,
      },
    ];
    locationRepo.find.mockResolvedValue(locations);

    const result = await service.findAllForHunt('h1', 'u1');
    expect(result).toEqual(locations);
    expect(huntService.isOwner).toHaveBeenCalledWith('h1', 'u1');
  });

  it('findAllForHunt returns filtered data for participants', async () => {
    huntService.ensureMember.mockResolvedValue(undefined);
    huntService.isOwner.mockResolvedValue(false);
    const locations = [
      {
        id: 'l1',
        name: 'Location 1',
        correctAnswer: 'Answer 1',
        orderIndex: 1,
      },
    ];
    locationRepo.find.mockResolvedValue(locations);

    const result = await service.findAllForHunt('h1', 'u1');
    expect(result).toEqual([
      { id: 'l1', name: 'Location 1', orderIndex: 1 },
    ]);
    expect(huntService.isOwner).toHaveBeenCalledWith('h1', 'u1');
  });

  it('findOne returns full data for owners', async () => {
    const location = {
      id: 'l1',
      name: 'Location 1',
      correctAnswer: 'Answer 1',
      treasureHunt: { id: 'h1' },
    };
    locationRepo.findOne.mockResolvedValue(location);
    huntService.ensureMember.mockResolvedValue(undefined);
    huntService.isOwner.mockResolvedValue(true);

    const result = await service.findOne('l1', 'u1');
    expect(result).toEqual(location);
    expect(huntService.isOwner).toHaveBeenCalledWith('h1', 'u1');
  });

  it('findOne returns filtered data for participants', async () => {
    const location = {
      id: 'l1',
      name: 'Location 1',
      correctAnswer: 'Answer 1',
      treasureHunt: { id: 'h1' },
    };
    locationRepo.findOne.mockResolvedValue(location);
    huntService.ensureMember.mockResolvedValue(undefined);
    huntService.isOwner.mockResolvedValue(false);

    const result = await service.findOne('l1', 'u1');
    expect(result).toEqual({
      id: 'l1',
      name: 'Location 1',
      treasureHunt: { id: 'h1' },
    });
    expect(huntService.isOwner).toHaveBeenCalledWith('h1', 'u1');
  });
});