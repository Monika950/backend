import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/auth.guard';
import { User } from './entities/user.entity';
import { Request } from 'express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserDto } from './dto/user.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
type AuthedRequest = Request & { user: { id: string } };

@ApiTags('Users')
@ApiExtraModels(ApiResponseDto, UserDto)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(UserDto) } } },
      ],
    },
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDto) },
            },
          },
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(UserDto) } } },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Req() req: AuthedRequest): Promise<User> {
    const userId = req.user.id;
    return this.userService.findOne(userId);
  }
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by id' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(UserDto) } } },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        { properties: { data: { $ref: getSchemaPath(UserDto) } } },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID (UUID)' })
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponseDto) },
        {
          properties: {
            data: {
              type: 'object',
              properties: { message: { type: 'string' } },
            },
          },
        },
      ],
    },
  })
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
