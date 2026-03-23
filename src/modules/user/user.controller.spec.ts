import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UserController', () => {
  let controller: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  it('create delegates to userService.create', async () => {
    userService.create.mockResolvedValue({ id: 'u1' } as any);
    const result = await controller.create({} as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.create).toHaveBeenCalled();
    expect(result).toEqual({ id: 'u1' });
  });

  it('getProfile returns userService.findOne result', async () => {
    userService.findOne.mockResolvedValue({ id: 'u1' } as any);
    const result = await controller.getProfile({ user: { id: 'u1' } } as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.findOne).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ id: 'u1' });
  });
});
