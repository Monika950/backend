import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { SafeUser } from './interfaces/safe-user.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { AuthResponseDto, SafeUserDto } from './dto/auth-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
type AuthedRequest = Request & { user: SafeUser };

@ApiTags('Auth')
@ApiExtraModels(ApiResponseDto, AuthResponseDto, SafeUserDto)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({
    summary: 'Register',
    description: 'Create a new user account',
  })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(AuthResponseDto) } } },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Validation error' })
  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({
    summary: 'Login',
    description: 'Authenticate with email and password',
  })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(AuthResponseDto) } } },
      ],
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() loginDto: LoginDto) {
    return this.authService.authenticate(loginDto);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(SafeUserDto) } } },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Get('me')
  getCurrentUser(@Req() req: AuthedRequest): SafeUser {
    return req.user;
  }

  @ApiOperation({ summary: 'Refresh tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(AuthResponseDto) } } },
      ],
    },
  })
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req: AuthedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @ApiOperation({ summary: 'Forgot password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({
    description: 'If an account exists, a reset link has been sent.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  @ApiOperation({ summary: 'Reset password' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    description: 'Password reset successful.',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return { message: 'Password reset successful.' };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout' })
  @ApiOkResponse({
    description: 'Successfully logged out',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: AuthedRequest) {
    const userId = req.user.id;
    await this.authService.logout(userId);
    return { message: 'Successfully logged out' };
  }
}
