import { InjectQueryService, QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { UserInputDTO } from './dto/user-input.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Resolver(() => UserDTO)
export class UserResolver extends CRUDResolver(UserDTO, {
  CreateDTOClass: UserInputDTO,
  UpdateDTOClass: UserInputDTO,
}) {
  constructor(@InjectQueryService(UserEntity) readonly service: QueryService<UserEntity>) {
    super(service);
  }
}
