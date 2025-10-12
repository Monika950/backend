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

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.userService.create(registerDto);
    return this.generateTokens(user);
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

  async hashData(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validateUser(loginDto: LoginDto): Promise<SafeUser | null> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    console.log(user.password, loginDto.password); //hashing
    const isValid = user && (await user.comparePassword(loginDto.password));

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

    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
      ...user,
    };
  }

  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthResponse> {
    const user = await this.userService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    if (typeof user.refreshToken !== 'string') {
      throw new ForbiddenException('Invalid stored refresh token');
    }

    const isMatch: boolean = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    if (!isMatch) {
      throw new ForbiddenException('Invalid refresh token');
    }

    const safeUser: SafeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return this.signIn(safeUser);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.userService.findOne(id);
    const isValid = user && (await user.comparePassword(oldPassword));

    if (!isValid) {
      new UnauthorizedException('Wrong credentials');
    }

    await this.userService.updatePassword(id, newPassword);

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

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`; //?

    // send reset email
    // await this.emailService.sendPasswordReset(user.email, resetLink);//implement
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

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const payload = await this.verifyResetToken(token);
    if (!payload) {
      throw new ForbiddenException('Invalid or expired token');
    }

    const user = await this.userService.findOne(payload.id);
    if (!user) throw new ForbiddenException('Invalid token');

    await this.userService.updatePassword(user.id, newPassword);
  }

  async logout(id: string): Promise<void> {
    await this.userService.updateRefreshToken(id, null);
  }
}
