import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(signInDto: SignInDto) {
    const user = await this.userService.findOneByEmail(
      //email!!! shouldn't be only by that; what if username given?
      signInDto.usernameOrEmail,
    );

    if (user && (await user.comparePassword(signInDto.password))) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    }

    return null;
  }

  async authenticate(signInDto: SignInDto) {
    const user = await this.validateUser(signInDto);

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      accessToken: 'access-token',
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.authenticate(signInDto);
    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
    };
  }
}
