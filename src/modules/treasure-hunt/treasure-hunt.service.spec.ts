import { Test, TestingModule } from '@nestjs/testing';
import { TreasureHuntService } from './treasure-hunt.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TreasureHunt } from './entities/treasure-hunt.entity';
import { TreasureHuntUser } from './entities/treasure-hunt-user.entity';
import { User } from '../user/entities/user.entity';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('TreasureHuntService', () => {
  let service: TreasureHuntService;
  
  const mockHuntRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
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
      const createDto = {
        name: 'Test Hunt',
        description: 'Test Description',
      };
      const userId = 'user-1';

      const mockHunt = {
        id: 'hunt-1',
        ...createDto,
        joinCode: '123456',
      };

      mockHuntRepository.create.mockReturnValue(mockHunt);
      mockHuntRepository.save.mockResolvedValue(mockHunt);
      mockHuntUserRepository.create.mockReturnValue({});
      mockHuntUserRepository.save.mockResolvedValue({});

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

      const result = await service.findOne(huntId);

      expect(result).toEqual(mockHunt);
      expect(mockHuntRepository.findOne).toHaveBeenCalledWith({
        where: { id: huntId },
        relations: expect.any(Array),
      });
    });

    it('should throw NotFoundException when hunt not found', async () => {
      mockHuntRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
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

      mockHuntRepository.findOne.mockResolvedValue(mockHunt);
      mockHuntUserRepository.findOne.mockResolvedValue(null);
      mockHuntUserRepository.create.mockReturnValue({});
      mockHuntUserRepository.save.mockResolvedValue({});

      const result = await service.joinByCode(joinCode, userId);

      expect(result).toEqual(mockHunt);
      expect(mockHuntUserRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException with invalid code', async () => {
      mockHuntRepository.findOne.mockResolvedValue(null);

      await expect(service.joinByCode('invalid', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if already joined', async () => {
      const mockHunt = {
        id: 'hunt-1',
        joinCode: '123456',
      };

      mockHuntRepository.findOne.mockResolvedValue(mockHunt);
      mockHuntUserRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(service.joinByCode('123456', 'user-1')).rejects.toThrow(
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

      mockHuntRepository.findOne.mockResolvedValue(mockHunt);
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'owner',
      });
      mockHuntRepository.save.mockResolvedValue({
        ...mockHunt,
        ...updateDto,
      });

      const result = await service.update(huntId, updateDto, userId);

      expect(result.name).toBe(updateDto.name);
      expect(mockHuntRepository.save).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockHuntRepository.findOne.mockResolvedValue({ id: 'hunt-1' });
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'participant',
      });

      await expect(
        service.update('hunt-1', { name: 'New' }, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete a treasure hunt successfully', async () => {
      const huntId = 'hunt-1';
      const userId = 'user-1';

      mockHuntRepository.findOne.mockResolvedValue({ id: huntId });
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'owner',
      });
      mockHuntRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete(huntId, userId);

      expect(mockHuntRepository.delete).toHaveBeenCalledWith(huntId);
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockHuntRepository.findOne.mockResolvedValue({ id: 'hunt-1' });
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'participant',
      });

      await expect(service.delete('hunt-1', 'user-1')).rejects.toThrow(
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
      mockHuntUserRepository.findOne.mockResolvedValue({
        role: 'participant',
      });

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