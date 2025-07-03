import { Injectable } from '@nestjs/common';
import { User } from '../entity/User';

@Injectable()
export class UsersService {
  private readonly users = [
    {
      id: '1',
      email: 'm@gmail.com',
      password: 'changeme',
      username: 'john',
      firstName: 'Moni',
      lastName: 'Georgieva',
    },
    {
      id: '2',
      email: 'k@gmail.com',
      password: 'changeme',
      username: 'kiki',
      firstName: 'kiki',
      lastName: 'George',
    },
  ];

  async findOne(username: string): Promise<User | undefined> {
    // Fake async delay (not necessary in real code, just to illustrate)
    return await Promise.resolve(
      this.users.find((user) => user.username === username),
    );
  }
}
