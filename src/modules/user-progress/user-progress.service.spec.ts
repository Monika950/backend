import { Test, TestingModule } from '@nestjs/testing';
import { UserProgressService } from './user-progress.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserProgress } from './entities/user-progress.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('UserProgressService', () => {
  let service: UserProgressService;
  const progressRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const userRepo = { findOne: jest.fn() };
  const huntRepo = { findOne: jest.fn() };
  const huntUserRepo = { findOne: jest.fn() };
  const locationRepo = { findOne: jest.fn() };
  const notifications = { create: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserProgressService,
        { provide: getRepositoryToken(UserProgress), useValue: progressRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(TreasureHunt), useValue: huntRepo },
        {
          provide: getRepositoryToken(TreasureHuntUser),
          useValue: huntUserRepo,
        },
        { provide: getRepositoryToken(Location), useValue: locationRepo },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<UserProgressService>(UserProgressService);
    jest.clearAllMocks();
  });

  it('startProgress returns existing progress if found', async () => {
    huntUserRepo.findOne.mockResolvedValue({ id: 'rel' });
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    huntRepo.findOne.mockResolvedValue({ id: 'h1' });
    progressRepo.findOne.mockResolvedValue({ id: 'p1' });

    const result = await service.startProgress('u1', 'h1');
    expect(result).toEqual({ id: 'p1' });
  });

  it('startProgress creates progress when none exists', async () => {
    huntUserRepo.findOne.mockResolvedValue({ id: 'rel' });
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    huntRepo.findOne.mockResolvedValue({ id: 'h1', name: 'H' });
    progressRepo.findOne.mockResolvedValue(null);
    locationRepo.findOne.mockResolvedValue(null);
    progressRepo.create.mockReturnValue({ id: 'p1' });
    progressRepo.save.mockResolvedValue({ id: 'p1', status: 'in_progress' });

    const result = await service.startProgress('u1', 'h1');
    expect(progressRepo.save).toHaveBeenCalled();
    expect(notifications.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'p1', status: 'in_progress' });
  });
});
