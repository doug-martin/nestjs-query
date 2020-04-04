import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { USER_CONNECTION } from '../constants';
import { UserEntity } from './user.entity';
import { UserResolver } from './user.resolver';

@Module({
  providers: [UserResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity], USER_CONNECTION)],
})
export class UserModule {}
