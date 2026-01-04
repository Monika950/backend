import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SafeUser } from './interfaces/safe-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { MailService } from '../../services/mail.service';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);

    return this.generateTokens({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  private async generateTokens(
    payload: JwtPayload,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, 10);
  }

  async validateUser(loginDto: LoginDto): Promise<SafeUser | null> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isValid) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async authenticate(
    loginDto: LoginDto,
  ): Promise<AuthResponse | UnauthorizedException> {
    const user = await this.validateUser(loginDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async signIn(user: SafeUser): Promise<AuthResponse> {
    const payload: JwtPayload = user;

    const { accessToken, refreshToken } = await this.generateTokens(payload);

    await this.userService.updateRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      ...user,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const user = await this.userService.findOne(refreshTokenDto.id);

    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    if (typeof user.refreshToken !== 'string') {
      throw new ForbiddenException('Invalid stored refresh token');
    }

    const isValid = await bcrypt.compare(
      refreshTokenDto.refreshToken,
      user.refreshToken,
    );

    if (!isValid) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const safeUser: SafeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return this.signIn(safeUser);
  }

  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findOne(id);
    const isValid =
      user &&
      (await bcrypt.compare(changePasswordDto.oldPassword, user.password));

    if (!isValid) {
      throw new UnauthorizedException('Wrong credentials');
    }

    await this.userService.updatePassword(id, changePasswordDto.newPassword);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userService.findOneByEmail(email);
    if (!user) return;

    const payload: JwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_RESET_SECRET,
      expiresIn: '15m',
    });

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    await this.mailService.sendPasswordResetEmail(user.email, resetLink);
  }

  private async verifyResetToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_RESET_SECRET,
      });
      return payload;
    } catch {
      return null;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const payload = await this.verifyResetToken(resetPasswordDto.token);

    if (!payload) {
      throw new ForbiddenException('Invalid or expired token');
    }

    const user = await this.userService.findOne(payload.id);
    if (!user) throw new ForbiddenException('Invalid token');

    await this.userService.updatePassword(
      user.id,
      resetPasswordDto.newPassword,
    );
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateRefreshToken(id, null);
  }
}
