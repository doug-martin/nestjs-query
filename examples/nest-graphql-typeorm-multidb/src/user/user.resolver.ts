import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TodoItemDTO } from '../todo-item/dto/todo-item.dto';
import { UserInputDTO } from './dto/user-input.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Resolver(() => UserDTO)
export class UserResolver extends CRUDResolver(UserDTO, {
  CreateDTOClass: UserInputDTO,
  UpdateDTOClass: UserInputDTO,
  relations: {
    many: {
      todoItems: { DTO: TodoItemDTO },
    },
  },
}) {
  constructor(@InjectTypeOrmQueryService(UserEntity) readonly service: QueryService<UserEntity>) {
    super(service);
  }
}
