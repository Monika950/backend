import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find({
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
    return users;
  }

  async findOne(id: string, requestingUserId?: string) {
    if (requestingUserId && requestingUserId !== id) {
      throw new ForbiddenException(
        'You do not have permission to access this user',
      );
    }

    const user = await this.usersRepository.findOne({
      where: { id },
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

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findOneOrFail(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOne({
      where: {
        username,
      },
    });
  }

  async findOneOrFailByUsername(username: string) {
    const user = await this.findOneByUsername(username);
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async findOneByEmail(email: string) {
    return await this.usersRepository.findOne({
      where: {
        email,
      },
    });
  }

  async findOneOrFailByEmail(email: string) {
    const user = await this.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    requestingUserId: string,
  ) {
    if (requestingUserId !== id) {
      throw new ForbiddenException(
        'You do not have permission to update this user',
      );
    }

    if (updateUserDto.username) {
      const userWithSameUsername = await this.findOneByUsername(
        updateUserDto.username,
      );
      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new ConflictException('Username already exists');
      }
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;
    user.username = updateUserDto.username;

    await this.usersRepository.save(user);

    const { password, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashed });
  }

  async updateRefreshToken(
    id: string,
    refreshToken: string | null,
  ): Promise<void> {
    if (refreshToken) {
      const hashed = await bcrypt.hash(refreshToken, 10);
      await this.usersRepository.update(id, { refreshToken: hashed });
    } else {
      await this.usersRepository.update(id, { refreshToken: null });
    }
  }

  async clearRefreshToken(id: string): Promise<void> {
    await this.usersRepository.update(id, { refreshToken: null });
  }

  async remove(id: string, requestingUserId: string) {
    if (requestingUserId !== id) {
      throw new ForbiddenException(
        'You do not have permission to delete this user',
      );
    }

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.usersRepository.delete(id);
    return { message: 'User deleted successfully' };
  }
}
