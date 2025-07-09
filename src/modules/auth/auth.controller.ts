import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
// import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.authenticate(signInDto);
  }

  // @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return req.user;
  }
}
