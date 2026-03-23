import { Test, TestingModule } from '@nestjs/testing';
import { UserProgressController } from './user-progress.controller';
import { UserProgressService } from './user-progress.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UserProgressController', () => {
  let controller: UserProgressController;
  let service: jest.Mocked<UserProgressService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserProgressController],
      providers: [
        {
          provide: UserProgressService,
          useValue: {
            startProgress: jest.fn(),
            updatePosition: jest.fn(),
            completeLocation: jest.fn(),
            abandon: jest.fn(),
            getProgressForHunt: jest.fn(),
            getParticipantProgressForHunt: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserProgressController>(UserProgressController);
    service = module.get(UserProgressService);
  });

  it('start delegates to service.startProgress', async () => {
    service.startProgress.mockResolvedValue({ id: 'p1' } as any);
    const result = await controller.start(
      { user: { id: 'u1' } } as any,
      { huntId: 'h1' } as any,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.startProgress).toHaveBeenCalledWith('u1', 'h1');
    expect(result).toEqual({ id: 'p1' });
  });

  it('getParticipantProgress delegates to service.getParticipantProgressForHunt', async () => {
    service.getParticipantProgressForHunt.mockResolvedValue({ id: 'p2' } as any);

    const result = await controller.getParticipantProgress(
      { user: { id: 'owner1' } } as any,
      'h1',
      'u2',
    );

    expect(service.getParticipantProgressForHunt).toHaveBeenCalledWith(
      'owner1',
      'h1',
      'u2',
    );
    expect(result).toEqual({ id: 'p2' });
  });
});
