import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';

describe('UploadsService', () => {
  let service: UploadsService;
  
  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        AWS_REGION: 'eu-north-1',
        AWS_ACCESS_KEY_ID: 'test-key',
        AWS_SECRET_ACCESS_KEY: 'test-secret',
        S3_BUCKET_NAME: 'test-bucket',
        S3_UPLOAD_PREFIX_LOCATIONS: 'uploads/locations',
        S3_UPLOAD_PREFIX_HUNTS: 'uploads/hunts',
        S3_ALLOWED_MIME: 'image/jpeg,image/png,image/webp',
        S3_MAX_FILE_SIZE: '2097152',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<UploadsService>(UploadsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPresignedUpload', () => {
    it('should throw BadRequestException for file too large', async () => {
      const dto = {
        kind: 'location' as const,
        filename: 'test.jpg',
        contentType: 'image/jpeg',
        size: 3000000, // Larger than max
      };

      await expect(service.createPresignedUpload(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for unsupported content type', async () => {
      const dto = {
        kind: 'location' as const,
        filename: 'test.pdf',
        contentType: 'application/pdf',
        size: 1000,
      };

      await expect(service.createPresignedUpload(dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createPresignedDownload', () => {
    it('should throw BadRequestException for empty key', async () => {
      await expect(service.createPresignedDownload('')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});