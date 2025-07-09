import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.create(createUserDto);
    await this.usersRepository.save(user);
    return user;
  }

  async findAll() {
    const users = await this.usersRepository.find();
    return users;
  }

  async findOne(id: string) {
    return await this.usersRepository.findOne({
      where: {
        id,
      },
    });
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
      throw new NotFoundException(`User with ID ${username} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.username) {
      const userWithSameUsername = await this.findOneByUsername(
        updateUserDto.username,
      );
      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new ConflictException('Username already exists');
      }
    }
    const user = await this.findOne(id);
    user.firstName = updateUserDto.firstName;
    user.lastName = updateUserDto.lastName;
    user.username = updateUserDto.username;
    user.password = updateUserDto.password;

    await this.usersRepository.save(user);
    return user;
  }

  async remove(id: string) {
    return this.usersRepository.delete(id);
  }
}
