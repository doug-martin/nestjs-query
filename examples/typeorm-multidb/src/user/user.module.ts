import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { USER_CONNECTION } from '../constants';
import { UserInputDTO } from './dto/user-input.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity], USER_CONNECTION)],
      resolvers: [
        {
          DTOClass: UserDTO,
          EntityClass: UserEntity,
          CreateDTOClass: UserInputDTO,
          UpdateDTOClass: UserInputDTO,
        },
      ],
    }),
  ],
})
export class UserModule {}
