import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  const repo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
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
      service.update('u1', { username: 'taken' } as any),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
