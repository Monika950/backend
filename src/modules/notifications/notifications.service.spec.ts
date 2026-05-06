import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotificationRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockNotificationsGateway = {
    emitToUser: jest.fn(),
    emitNew: jest.fn(),
    emitRead: jest.fn(),
    emitReadBatch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        {
          provide: NotificationsGateway,
          useValue: mockNotificationsGateway,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification successfully', async () => {
      const createDto = {
        userId: 'user-1',
        type: 'HUNT_JOINED',
        payload: { huntId: 'hunt-1' },
        huntId: 'hunt-1',
      };

      const mockNotification = {
        id: 'notif-1',
        ...createDto,
        createdAt: new Date(),
        readAt: null,
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(
        createDto.userId,
        createDto.type,
        createDto.payload,
        createDto.huntId,
      );

      expect(result).toEqual(mockNotification);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockNotificationsGateway.emitToUser).toHaveBeenCalledWith(
        createDto.userId,
        'notifications:new',
        mockNotification,
      );
    });

    it('should create notification without huntId', async () => {
      const createDto = {
        userId: 'user-1',
        type: 'SYSTEM_MESSAGE',
        payload: { message: 'Hello' },
      };

      const mockNotification = {
        id: 'notif-1',
        ...createDto,
        huntId: null,
        createdAt: new Date(),
        readAt: null,
      };

      mockNotificationRepository.create.mockReturnValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue(mockNotification);

      const result = await service.create(
        createDto.userId,
        createDto.type,
        createDto.payload,
      );

      expect(result).toEqual(mockNotification);
      expect(result.huntId).toBeNull();
    });
  });

  describe('list', () => {
    it('should return paginated notifications', async () => {
      const userId = 'user-1';
      const mockNotifications = [
        {
          id: 'notif-1',
          userId,
          type: 'HUNT_JOINED',
          createdAt: new Date(),
        },
        {
          id: 'notif-2',
          userId,
          type: 'HUNT_STARTED',
          createdAt: new Date(),
        },
      ];

      mockNotificationRepository.findAndCount.mockResolvedValue([
        mockNotifications,
        2,
      ]);

      const result = await service.list(userId, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockNotifications);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should filter by read status', async () => {
      const userId = 'user-1';
      const mockNotifications = [
        {
          id: 'notif-1',
          userId,
          readAt: new Date(),
        },
      ];

      mockNotificationRepository.findAndCount.mockResolvedValue([
        mockNotifications,
        1,
      ]);

      await service.list(userId, { page: 1, limit: 10, read: true });

      expect(mockNotificationRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId,
            readAt: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('markRead', () => {
    it('should mark notification as read', async () => {
      const notificationId = 'notif-1';
      const userId = 'user-1';

      const mockNotification = {
        id: notificationId,
        userId,
        readAt: null,
      };

      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);
      mockNotificationRepository.save.mockResolvedValue({
        ...mockNotification,
        readAt: new Date(),
      });

      const result = await service.markRead(userId, notificationId);

      expect(result.readAt).toBeDefined();
      expect(mockNotificationRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(service.markRead('user-1', 'nonexistent')).rejects.toThrow();
    });
  });

  describe('markReadBatch', () => {
    it('should mark multiple notifications as read', async () => {
      const userId = 'user-1';
      const ids = ['notif-1', 'notif-2'];

      const mockNotifications = [
        { id: 'notif-1', userId, readAt: null },
        { id: 'notif-2', userId, readAt: null },
      ];

      mockNotificationRepository.find.mockResolvedValue(mockNotifications);
      mockNotificationRepository.save.mockResolvedValue(mockNotifications);

      const result = await service.markReadBatch(userId, ids);

      expect(result).toBe(2);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockNotificationsGateway.emitToUser).toHaveBeenCalled();
    });

    it('should return 0 if no notifications to update', async () => {
      mockNotificationRepository.find.mockResolvedValue([]);

      const result = await service.markReadBatch('user-1', []);

      expect(result).toBe(0);
    });
  });
});
