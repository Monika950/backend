import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { SafeUser } from './interfaces/safe-user.interface';
import { AuthResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(signInDto: SignInDto): Promise<SafeUser | null> {
    const user = await this.userService.findOneByEmail(signInDto.email);
    const isValid = user && (await user.comparePassword(signInDto.password));

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
    signInDto: SignInDto,
  ): Promise<AuthResponse | UnauthorizedException> {
    const user = await this.validateUser(signInDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.signIn(user);
  }

  async signIn(user: SafeUser): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    ]);

    const hashedRefreshToken = await bcrypt.hash(refresh_token, 10);
    await this.userService.updateRefreshToken(user.id, hashedRefreshToken);

    return {
      accessToken: access_token,
      refreshToken: refresh_token,
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
}
