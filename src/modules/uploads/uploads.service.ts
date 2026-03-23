import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { PresignUploadDto } from './dto/presign-upload.dto';

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly allowedMime: Set<string>;
  private readonly maxSize: number;
  private readonly prefixLocations: string;
  private readonly prefixHunts: string;

  constructor(private readonly config: ConfigService) {
    const region = this.config.get<string>('AWS_REGION');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');
    this.bucket = this.config.get<string>('S3_BUCKET_NAME') ?? '';

    this.prefixLocations =
      this.config.get<string>('S3_UPLOAD_PREFIX_LOCATIONS') ??
      'uploads/locations';
    this.prefixHunts =
      this.config.get<string>('S3_UPLOAD_PREFIX_HUNTS') ?? 'uploads/hunts';

    const allowed =
      this.config.get<string>('S3_ALLOWED_MIME') ??
      'image/jpeg,image/png,image/webp';
    this.allowedMime = new Set(
      allowed
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean),
    );
    this.maxSize = Number(this.config.get<string>('S3_MAX_FILE_SIZE') ?? 0);

    if (!region || !accessKeyId || !secretAccessKey || !this.bucket) {
      throw new Error(
        'Missing AWS S3 configuration (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET_NAME)',
      );
    }

    this.s3 = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: 'WHEN_REQUIRED',
      responseChecksumValidation: 'WHEN_REQUIRED',
    });
  }

  async createPresignedUpload(dto: PresignUploadDto) {
    if (this.maxSize > 0 && dto.size > this.maxSize) {
      throw new BadRequestException('File too large');
    }
    if (!this.allowedMime.has(dto.contentType)) {
      throw new BadRequestException('Unsupported content type');
    }

    const ext = this.extractExtension(dto.filename);
    const prefix =
      dto.kind === 'location' ? this.prefixLocations : this.prefixHunts;
    const key = `${prefix}/${randomUUID()}${ext ? `.${ext}` : ''}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: dto.contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return {
      key,
      uploadUrl,
      expiresIn: 300,
      contentType: dto.contentType,
      method: 'PUT',
      requiredHeaders: {
        'Content-Type': dto.contentType,
      },
    };
  }

  async createPresignedDownload(key: string) {
    if (!key) throw new BadRequestException('Key is required');

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const downloadUrl = await getSignedUrl(this.s3, command, {
      expiresIn: 300,
    });

    return { key, downloadUrl, expiresIn: 300 };
  }

  private extractExtension(filename: string): string {
    const clean = filename.split('?')[0].split('#')[0];
    const idx = clean.lastIndexOf('.');
    if (idx === -1) return '';
    return clean.slice(idx + 1).toLowerCase();
  }
}
