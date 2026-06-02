import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException, ForbiddenException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  it('create saves a new user', async () => {
    repo.create.mockReturnValue({ id: 'u1' });
    repo.save.mockResolvedValue({ id: 'u1' });

    const result = await service.create({ email: 'a@b.com' } as any);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.save).toHaveBeenCalled();
    expect(result).toEqual({ id: 'u1' });
  });

  it('update throws if username exists for another user', async () => {
    repo.findOne.mockResolvedValueOnce({ id: 'u2' });
    await expect(
      service.update('u1', { username: 'taken' } as any, 'u1'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('update throws ForbiddenException if user tries to update another user', async () => {
    await expect(
      service.update('u1', { username: 'newname' } as any, 'u2'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('findOne throws ForbiddenException when accessing another user', async () => {
    await expect(service.findOne('u1', 'u2')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('findOne returns user when accessing own profile', async () => {
    const user = {
      id: 'u1',
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.findOne.mockResolvedValue(user);

    const result = await service.findOne('u1', 'u1');
    expect(result).toEqual(user);
  });

  it('findAll returns users without sensitive fields', async () => {
    const users = [
      {
        id: 'u1',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    repo.find.mockResolvedValue(users);

    const result = await service.findAll();
    expect(result).toEqual(users);
    expect(repo.find).toHaveBeenCalledWith({
      select: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'createdAt',
        'updatedAt',
      ],
    });
  });

  it('remove throws ForbiddenException if user tries to delete another user', async () => {
    await expect(service.remove('u1', 'u2')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('remove deletes user successfully when deleting own account', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'u1' });
    repo.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove('u1', 'u1');
    expect(result).toEqual({ message: 'User deleted successfully' });
    expect(repo.delete).toHaveBeenCalledWith('u1');
  });
});
