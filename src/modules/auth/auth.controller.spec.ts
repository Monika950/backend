import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SafeUser } from './interfaces/safe-user.interface';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            authenticate: jest.fn(),
            refreshTokens: jest.fn(),
            changePassword: jest.fn(),
            forgotPassword: jest.fn(),
            resetPassword: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('register delegates to authService.register', async () => {
    authService.register.mockResolvedValue({
      accessToken: 'a',
      refreshToken: 'r',
    } as any);
    const dto: RegisterDto = {
      email: 'a@b.com',
      password: 'Password123!',
      username: 'user1',
      firstName: 'A',
      lastName: 'B',
    };
    const result = await controller.register(dto);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.register).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'a', refreshToken: 'r' });
  });

  it('login delegates to authService.authenticate', async () => {
    authService.authenticate.mockResolvedValue({ accessToken: 'a' } as any);
    const dto: LoginDto = { email: 'a@b.com', password: 'Password123!' };
    const result = await controller.signIn(dto);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.authenticate).toHaveBeenCalled();
    expect(result).toEqual({ accessToken: 'a' });
  });

  it('getCurrentUser returns req.user', () => {
    const user: SafeUser = { id: 'u1', username: 'u', email: 'e@e.com' };
    const req: { user: SafeUser } = { user };
    expect(controller.getCurrentUser(req as any)).toBe(user);
  });

  it('logout delegates to authService.logout', async () => {
    authService.logout.mockResolvedValue(undefined);
    const req: { user: SafeUser } = {
      user: { id: 'u1', username: 'u', email: 'e@e.com' },
    };
    const result = await controller.logout(req as any);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.logout).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ message: 'Successfully logged out' });
  });

  it('redirectResetPassword returns 400 when token missing', () => {
    const send = jest.fn();
    const status = jest.fn().mockReturnValue({ send });
    const res = { status } as any;

    controller.redirectResetPassword(undefined as any, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(send).toHaveBeenCalledWith('Missing reset token');
  });

  it('redirectResetPassword redirects to app URL from FRONTEND_URL', () => {
    const previous = process.env.FRONTEND_URL;
    process.env.FRONTEND_URL = 'treasurehuntapp:/';

    const redirect = jest.fn();
    const res = { redirect } as any;

    controller.redirectResetPassword('abc+123', res);

    expect(redirect).toHaveBeenCalledWith(
      302,
      'treasurehuntapp:/auth/reset-password?token=abc%2B123',
    );

    process.env.FRONTEND_URL = previous;
  });
});
