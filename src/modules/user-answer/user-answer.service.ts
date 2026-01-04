import { Injectable } from '@nestjs/common';
import { CreateUserAnswerDto } from './dto/create-user-answer.dto';
import { UpdateUserAnswerDto } from './dto/update-user-answer.dto';

@Injectable()
export class UserAnswerService {
  create(_createUserAnswerDto: CreateUserAnswerDto) {
    void _createUserAnswerDto;
    return 'This action adds a new userAnswer';
  }

  findAll() {
    return `This action returns all userAnswer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userAnswer`;
  }

  update(id: number, _updateUserAnswerDto: UpdateUserAnswerDto) {
    void _updateUserAnswerDto;
    return `This action updates a #${id} userAnswer`;
  }

  remove(id: number) {
    return `This action removes a #${id} userAnswer`;
  }
}
