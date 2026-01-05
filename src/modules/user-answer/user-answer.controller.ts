import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UserAnswerService } from './user-answer.service';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { AuthGuard } from '../auth/auth.guard';

type AuthedRequest = Request & { user: { id: string } };

@UseGuards(AuthGuard)
@Controller('user-answer')
export class UserAnswerController {
  constructor(private readonly userAnswerService: UserAnswerService) {}

  @Post()
  async submit(@Req() req: AuthedRequest, @Body() dto: CreateUserAnswerDto) {
    return this.userAnswerService.submitAnswer(
      req.user.id,
      dto.locationId,
      dto.answer,
    );
  }

  // - owner: all participants' answers
  // - participant: only own answers
  @Get('hunt/:huntId')
  async getAnswersForHunt(
    @Req() req: AuthedRequest,
    @Param('huntId') huntId: string,
  ) {
    return this.userAnswerService.getAnswersForHunt(req.user.id, huntId);
  }
}
