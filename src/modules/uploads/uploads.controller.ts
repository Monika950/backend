import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { UploadsService } from './uploads.service';
import { PresignUploadDto } from './dto/presign-upload.dto';
import { PresignDownloadDto } from './dto/presign-download.dto';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('presign')
  @ApiOperation({ summary: 'Create pre-signed S3 upload URL' })
  @ApiBody({ type: PresignUploadDto })
  @ApiOkResponse({ description: 'Pre-signed upload URL created' })
  async presignUpload(@Body() dto: PresignUploadDto) {
    return this.uploadsService.createPresignedUpload(dto);
  }

  @Post('presign-download')
  @ApiOperation({ summary: 'Create pre-signed S3 download URL' })
  @ApiBody({ type: PresignDownloadDto })
  @ApiOkResponse({ description: 'Pre-signed download URL created' })
  async presignDownload(@Body() dto: PresignDownloadDto) {
    return this.uploadsService.createPresignedDownload(dto.key);
  }
}
