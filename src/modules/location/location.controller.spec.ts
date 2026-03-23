import { Test, TestingModule } from '@nestjs/testing';
import { LocationController } from './location.controller';
import { LocationService } from './location.service';
import { AuthGuard } from '../auth/auth.guard';

describe('LocationController', () => {
  let controller: LocationController;
  let service: jest.Mocked<LocationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationController],
      providers: [
        {
          provide: LocationService,
          useValue: {
            create: jest.fn(),
            findAllForHunt: jest.fn(),
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

    controller = module.get<LocationController>(LocationController);
    service = module.get(LocationService);
  });

  it('create delegates to service.create', async () => {
    service.create.mockResolvedValue({ id: 'l1' } as any);
    const result = await controller.create(
      { user: { id: 'u1' } } as any,
      {} as any,
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.create).toHaveBeenCalledWith({}, 'u1');
    expect(result).toEqual({ id: 'l1' });
  });
});
