import { NestjsQueryGraphQLModule } from '@nestjs-query/query-graphql';
import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { UserInputDTO } from './dto/user-input.dto';
import { UserUpdateDTO } from './dto/user-update.dto';
import { UserDTO } from './dto/user.dto';
import { UserEntity } from './user.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
      resolvers: [
        {
          DTOClass: UserDTO,
          EntityClass: UserEntity,
          CreateDTOClass: UserInputDTO,
          UpdateDTOClass: UserUpdateDTO,
          referenceBy: { key: 'id' },
        },
      ],
    }),
  ],
})
export class UserModule {}
