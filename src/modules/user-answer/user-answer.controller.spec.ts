import { Test, TestingModule } from '@nestjs/testing';
import { UserAnswerController } from './user-answer.controller';
import { UserAnswerService } from './user-answer.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UserAnswerController', () => {
  let controller: UserAnswerController;
  let service: jest.Mocked<UserAnswerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserAnswerController],
      providers: [
        {
          provide: UserAnswerService,
          useValue: {
            submitAnswer: jest.fn(),
            getAnswersForHunt: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserAnswerController>(UserAnswerController);
    service = module.get(UserAnswerService);
  });

  it('submit delegates to service.submitAnswer', async () => {
    service.submitAnswer.mockResolvedValue({ isCorrect: true } as any);
    const result = await controller.submit(
      { user: { id: 'u1' } } as any,
      { locationId: 'l1', answer: 'A' } as any,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.submitAnswer).toHaveBeenCalledWith('u1', 'l1', 'A');
    expect(result).toEqual({ isCorrect: true });
  });
});
