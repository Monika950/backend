import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      mockUserRepository.create.mockReturnValue({
        id: '1',
        ...registerDto,
        password: 'hashedPassword',
      });
      mockUserRepository.save.mockResolvedValue({
        id: '1',
        ...registerDto,
        password: 'hashedPassword',
      });
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if user already exists', async () => {
      const registerDto = {
        email: 'existing@example.com',
        password: 'password123',
        username: 'existinguser',
      };

      mockUserRepository.findOne.mockResolvedValue({ id: '1' });

      await expect(service.register(registerDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login user successfully with correct credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const user = {
        id: '1',
        email: loginDto.email,
        password: 'hashedPassword',
        username: 'testuser',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: '1',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should return user data when token is valid', async () => {
      const payload = { sub: '1', email: 'test@example.com' };
      const user = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockJwtService.verify.mockReturnValue(payload);
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await service.validateUser('valid_token');

      expect(result).toEqual(user);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid_token');
    });

    it('should throw UnauthorizedException when token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.validateUser('invalid_token')).rejects.toThrow();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const userId = '1';
      const changePasswordDto = {
        oldPassword: 'oldPassword123',
        newPassword: 'newPassword123',
      };

      const user = {
        id: userId,
        password: 'hashedOldPassword',
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPassword');
      mockUserRepository.save.mockResolvedValue({
        ...user,
        password: 'hashedNewPassword',
      });

      await service.changePassword(userId, changePasswordDto);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.oldPassword,
        user.password,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(
        changePasswordDto.newPassword,
        10,
      );
      expect(mockUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException with wrong old password', async () => {
      const userId = '1';
      const changePasswordDto = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword123',
      };

      mockUserRepository.findOne.mockResolvedValue({
        id: userId,
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(userId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
