import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntService } from './treasure-hunt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TreasureHuntUser } from './entities/treasure-hunt-user.entity';
import { User } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('TreasureHuntService', () => {
  let service: TreasureHuntService;
  const huntRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOne: jest.fn(),
  };
  const huntUserRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };
  const userRepo = {
    findOneBy: jest.fn(),
  };
  const notifications = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasureHuntService,
        { provide: getRepositoryToken(TreasureHunt), useValue: huntRepo },
        {
          provide: getRepositoryToken(TreasureHuntUser),
          useValue: huntUserRepo,
        },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: NotificationsService, useValue: notifications },
      ],
    }).compile();

    service = module.get<TreasureHuntService>(TreasureHuntService);
    jest.clearAllMocks();
  });

  it('create saves hunt and owner relation', async () => {
    userRepo.findOneBy.mockResolvedValue({ id: 'u1' });
    huntRepo.create.mockReturnValue({ name: 'H' });
    huntRepo.save.mockResolvedValue({ id: 'h1', name: 'H' });
    huntUserRepo.create.mockReturnValue({ id: 'rel1' });
    huntUserRepo.save.mockResolvedValue({ id: 'rel1' });

    const result = await service.create(
      {
        name: 'H',
        description: 'D',
        start: new Date(),
        end: new Date(),
      } as any,
      'u1',
    );

    expect(result).toEqual({ id: 'h1', name: 'H' });
    expect(huntUserRepo.save).toHaveBeenCalled();
  });

  it('joinByCode creates relation and notification', async () => {
    userRepo.findOneBy.mockResolvedValue({ id: 'u1' });
    huntRepo.findOneBy.mockResolvedValue({ id: 'h1', name: 'H' });
    huntUserRepo.findOne.mockResolvedValue(null);
    huntUserRepo.create.mockReturnValue({ id: 'rel1' });
    huntUserRepo.save.mockResolvedValue({ id: 'rel1' });

    const result = await service.joinByCode('u1', '123456');

    expect(result).toEqual({
      message: 'Successfully joined the treasure hunt',
      treasureHuntId: 'h1',
    });
    expect(notifications.create).toHaveBeenCalled();
  });
});
