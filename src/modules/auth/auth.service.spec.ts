import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../../services/mail.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
            findOne: jest.fn(),
            findOneByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  it('register returns tokens and calls userService.create', async () => {
    userService.create.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
      username: 'user1',
    } as any);
    jwtService.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');

    const result = await service.register({
      email: 'a@b.com',
      password: 'Password123!',
      username: 'user1',
      firstName: 'A',
      lastName: 'B',
    } as any);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(userService.create).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('authenticate throws when credentials invalid', async () => {
    jest.spyOn(service as any, 'validateUser').mockResolvedValue(null);
    await expect(
      service.authenticate({ email: 'x@y.com', password: 'bad' } as any),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refreshTokens returns new tokens when refresh token matches', async () => {
    userService.findOne.mockResolvedValue({
      id: 'u1',
      username: 'user1',
      email: 'a@b.com',
      refreshToken: 'hashed',
    } as any);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    jwtService.signAsync
      .mockResolvedValueOnce('access')
      .mockResolvedValueOnce('refresh');

    const result = await service.refreshTokens({
      id: 'u1',
      refreshToken: 'plain',
    } as any);

    expect(result.accessToken).toBe('access');
    expect(result.refreshToken).toBe('refresh');
  });

  it('refreshTokens throws when refresh token missing', async () => {
    userService.findOne.mockResolvedValue({
      id: 'u1',
      username: 'user1',
      email: 'a@b.com',
      refreshToken: null,
    } as any);

    await expect(
      service.refreshTokens({ id: 'u1', refreshToken: 'x' } as any),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
