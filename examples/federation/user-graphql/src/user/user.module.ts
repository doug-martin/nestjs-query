import { Module } from '@nestjs/common'
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql'
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm'

import { UserDTO } from './dto/user.dto'
import { UserInputDTO } from './dto/user-input.dto'
import { UserUpdateDTO } from './dto/user-update.dto'
import { UserEntity } from './user.entity'

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
          referenceBy: { key: 'id' }
        }
      ]
    })
  ]
})
export class UserModule {}
