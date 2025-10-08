import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { PASSWORD_REGEX, PASSWORD_MESSAGE } from '../constants/regex.constants';

export function IsStrongPassword() {
  return applyDecorators(
    Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE }),
  );
}
