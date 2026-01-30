import { Test, TestingModule } from '@nestjs/testing';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { AuthGuard } from '../auth/auth.guard';

describe('UploadsController', () => {
  let controller: UploadsController;
  let service: jest.Mocked<UploadsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: {
            createPresignedUpload: jest.fn(),
            createPresignedDownload: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get(UploadsService);
  });

  it('presignUpload delegates to service', async () => {
    service.createPresignedUpload.mockResolvedValue({ uploadUrl: 'u' } as any);
    const result = await controller.presignUpload({
      kind: 'location',
      filename: 'a.jpg',
      contentType: 'image/jpeg',
      size: 1,
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.createPresignedUpload).toHaveBeenCalled();
    expect(result).toEqual({ uploadUrl: 'u' });
  });
});
