import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswerService } from './user-answer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAnswer } from './entities/user-answer.entity';
import { User } from '../user/entities/user.entity';
import { TreasureHunt } from '../treasure-hunt/entities/treasure-hunt.entity';
import { TreasureHuntUser } from '../treasure-hunt/entities/treasure-hunt-user.entity';
import { Location } from '../location/entities/location.entity';
import { UserProgressService } from '../user-progress/user-progress.service';

describe('UserAnswerService', () => {
  let service: UserAnswerService;
  const answerRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };
  const userRepo = { findOne: jest.fn() };
  const huntRepo = { findOne: jest.fn() };
  const huntUserRepo = { findOne: jest.fn() };
  const locationRepo = { findOne: jest.fn() };
  const progressService = { completeLocation: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAnswerService,
        { provide: getRepositoryToken(UserAnswer), useValue: answerRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(TreasureHunt), useValue: huntRepo },
        {
          provide: getRepositoryToken(TreasureHuntUser),
          useValue: huntUserRepo,
        },
        { provide: getRepositoryToken(Location), useValue: locationRepo },
        { provide: UserProgressService, useValue: progressService },
      ],
    }).compile();

    service = module.get<UserAnswerService>(UserAnswerService);
    jest.clearAllMocks();
  });

  it('submitAnswer returns isCorrect true when answer matches', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'u1' });
    locationRepo.findOne.mockResolvedValue({
      id: 'l1',
      correctAnswer: 'A',
      treasureHunt: { id: 'h1' },
    });
    huntUserRepo.findOne.mockResolvedValue({ id: 'rel' });
    answerRepo.findOne.mockResolvedValue(null);
    answerRepo.create.mockReturnValue({ id: 'a1' });
    answerRepo.save.mockResolvedValue({ id: 'a1' });
    progressService.completeLocation.mockResolvedValue({
      status: 'in_progress',
      currentLocationId: null,
      completedLocations: [],
      completedAt: null,
    });

    const result = await service.submitAnswer('u1', 'l1', 'A');
    expect(result.isCorrect).toBe(true);
    expect(progressService.completeLocation).toHaveBeenCalled();
  });
});
