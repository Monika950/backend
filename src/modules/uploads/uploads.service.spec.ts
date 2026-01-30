import { Test, TestingModule } from '@nestjs/testing';
import { UploadsService } from './uploads.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));

describe('UploadsService', () => {
  const config = {
    get: jest.fn(),
  };

  beforeEach(() => {
    config.get.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        AWS_REGION: 'eu-north-1',
        AWS_ACCESS_KEY_ID: 'test',
        AWS_SECRET_ACCESS_KEY: 'test',
        S3_BUCKET_NAME: 'treasure-hunt-app-bucket',
        S3_UPLOAD_PREFIX_LOCATIONS: 'uploads/locations',
        S3_UPLOAD_PREFIX_HUNTS: 'uploads/hunts',
        S3_ALLOWED_MIME: 'image/jpeg,image/png,image/webp',
        S3_MAX_FILE_SIZE: '2097152',
      };
      return map[key];
    });
    (getSignedUrl as jest.Mock).mockResolvedValue('https://signed');
  });

  it('creates a presigned upload URL with location prefix', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, { provide: ConfigService, useValue: config }],
    }).compile();

    const service = module.get<UploadsService>(UploadsService);
    const result = await service.createPresignedUpload({
      kind: 'location',
      filename: 'photo.JPG',
      contentType: 'image/jpeg',
      size: 1024,
    });

    expect(result.uploadUrl).toBe('https://signed');
    expect(result.key).toMatch(/^uploads\/locations\/.+\.jpg$/);
  });

  it('rejects oversized files', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService, { provide: ConfigService, useValue: config }],
    }).compile();

    const service = module.get<UploadsService>(UploadsService);
    await expect(
      service.createPresignedUpload({
        kind: 'hunt',
        filename: 'x.png',
        contentType: 'image/png',
        size: 3 * 1024 * 1024,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
