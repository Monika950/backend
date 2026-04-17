import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntController } from './treasure-hunt.controller';
import { TreasureHuntService } from './treasure-hunt.service';
import { AuthGuard } from '../auth/auth.guard';

describe('TreasureHuntController', () => {
  let controller: TreasureHuntController;
  let service: jest.Mocked<TreasureHuntService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TreasureHuntController],
      providers: [
        {
          provide: TreasureHuntService,
          useValue: {
            create: jest.fn(),
            findAllForUser: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            joinByCode: jest.fn(),
            addOwner: jest.fn(),
            getParticipants: jest.fn(),
            changeRole: jest.fn(),
            removeParticipant: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<TreasureHuntController>(TreasureHuntController);
    service = module.get(TreasureHuntService);
  });

  it('create delegates to service.create', async () => {
    service.create.mockResolvedValue({ id: 'h1' } as any);
    const result = await controller.create(
      { user: { id: 'u1' } } as any,
      {} as any,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.create).toHaveBeenCalledWith({}, 'u1');
    expect(result).toEqual({ id: 'h1' });
  });

  it('join delegates to service.joinByCode', async () => {
    service.joinByCode.mockResolvedValue({ message: 'ok' } as any);
    const result = await controller.join(
      { user: { id: 'u1' } } as any,
      { code: '123456' } as any,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.joinByCode).toHaveBeenCalledWith('u1', '123456');
    expect(result).toEqual({ message: 'ok' });
  });

  it('removeParticipant delegates to service.removeParticipant', async () => {
    service.removeParticipant.mockResolvedValue({ message: 'removed' } as any);

    const result = await controller.removeParticipant('h1', 'u2', {
      user: { id: 'owner1' },
    } as any);

    expect(service.removeParticipant).toHaveBeenCalledWith(
      'h1',
      'owner1',
      'u2',
    );
    expect(result).toEqual({ message: 'removed' });
  });
});
