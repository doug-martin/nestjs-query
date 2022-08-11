import { Module } from '@nestjs/common'
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm'

import { UserEntity } from './user.entity'

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
  exports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])]
})
export class UserModule {}
