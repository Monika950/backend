import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntService } from './treasure-hunt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TreasureHuntUser } from './entities/treasure-hunt-user.entity';
import { User } from '../user/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('TreasureHuntService', () => {
  let service: TreasureHuntService;
  
  const mockHuntRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockHuntUserRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
  };
  
  const mockUserRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const mockNotificationsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TreasureHuntService,
        {
          provide: getRepositoryToken(TreasureHunt),
          useValue: mockHuntRepository,
        },
        {
          provide: getRepositoryToken(TreasureHuntUser),
          useValue: mockHuntUserRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<TreasureHuntService>(TreasureHuntService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a treasure hunt successfully', async () => {
      const userId = 'user-1';
      const createDto = {
        name: 'Test Hunt',
        description: 'A test treasure hunt',
        start: new Date(),
        end: new Date(),
      };

      const mockHunt = {
        id: 'hunt-1',
        ...createDto,
        joinCode: '123456',
      };

      mockHuntRepository.create.mockReturnValue(mockHunt);
      mockHuntRepository.save.mockResolvedValue(mockHunt);
      mockHuntUserRepository.create.mockReturnValue({});
      mockHuntUserRepository.save.mockResolvedValue({});
      mockUserRepository.findOneBy.mockResolvedValue({ id: userId });

      const result = await service.create(createDto, userId);

      expect(result).toEqual(mockHunt);
      expect(mockHuntRepository.create).toHaveBeenCalled();
      expect(mockHuntRepository.save).toHaveBeenCalled();
      expect(mockHuntUserRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a treasure hunt by id', async () => {
      const huntId = 'hunt-1';
      const mockHunt = {
        id: huntId,
        name: 'Test Hunt',
      };

      mockHuntRepository.findOne.mockResolvedValue(mockHunt);

      mockHuntUserRepository.findOne.mockResolvedValue({
        treasureHunt: mockHunt,
      });

      const result = await service.findOne(huntId, 'user-1');

      expect(result).toEqual(mockHunt);
    });

    it('should throw ForbiddenException when user not part of hunt', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent', 'user-1')).rejects.toThrow();
    });
  });

  describe('joinByCode', () => {
    it('should join a hunt by code successfully', async () => {
      const joinCode = '123456';
      const userId = 'user-1';

      const mockHunt = {
        id: 'hunt-1',
        joinCode,
        name: 'Test Hunt',
      };

      mockUserRepository.findOneBy.mockResolvedValue({ id: userId });
      mockHuntRepository.findOneBy.mockResolvedValue(mockHunt);
      mockHuntUserRepository.findOne.mockResolvedValue(null);
      mockHuntUserRepository.create.mockReturnValue({});
      mockHuntUserRepository.save.mockResolvedValue({});

      const result = await service.joinByCode(userId, joinCode);

      expect(result).toEqual({
        message: 'Successfully joined the treasure hunt',
        treasureHuntId: 'hunt-1',
      });
      expect(mockHuntUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException with invalid code', async () => {
      mockUserRepository.findOneBy.mockResolvedValue({ id: 'user-1' });
      mockHuntRepository.findOneBy.mockResolvedValue(null);

      await expect(service.joinByCode('user-1', 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already joined', async () => {
      const mockHunt = {
        id: 'hunt-1',
        joinCode: '123456',
      };

      mockUserRepository.findOneBy.mockResolvedValue({ id: 'user-1' });
      mockHuntRepository.findOneBy.mockResolvedValue(mockHunt);
      mockHuntUserRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.joinByCode('user-1', '123456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a treasure hunt successfully', async () => {
      const huntId = 'hunt-1';
      const userId = 'user-1';
      const updateDto = {
        name: 'Updated Hunt',
      };

      const mockHunt = {
        id: huntId,
        name: 'Old Name',
      };

      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'owner',
      });
      mockHuntRepository.update.mockResolvedValue({ affected: 1 } as any);
      mockHuntRepository.findOneBy.mockResolvedValue({
        ...mockHunt,
        ...updateDto,
      });

      const result = await service.update(huntId, userId, updateDto);

      expect(result.name).toBe(updateDto.name);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('hunt-1', 'user-1', { name: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a treasure hunt successfully', async () => {
      const huntId = 'hunt-1';
      const userId = 'user-1';

      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'owner',
      });
      mockHuntRepository.delete.mockResolvedValue({ affected: 1 } as any);

      await service.remove(huntId, userId);

      expect(mockHuntRepository.delete).toHaveBeenCalledWith(huntId);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('hunt-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('ensureOwner', () => {
    it('should not throw when user is owner', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'owner',
      });

      await expect(
        service.ensureOwner('hunt-1', 'user-1'),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException when user is not owner', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue(null);

      await expect(service.ensureOwner('hunt-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('ensureMember', () => {
    it('should not throw when user is member', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'participant',
      });

      await expect(
        service.ensureMember('hunt-1', 'user-1'),
      ).resolves.not.toThrow();
    });

    it('should throw ForbiddenException when user is not member', async () => {
      mockHuntUserRepository.findOne.mockResolvedValue(null);

      await expect(service.ensureMember('hunt-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});