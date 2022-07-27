import { NestjsQueryTypeOrmModule } from '@codeshine/nestjs-query-typeorm';
import { Module } from '@nestjs/common';
import { UserEntity } from './user.entity';

@Module({
  imports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
  exports: [NestjsQueryTypeOrmModule.forFeature([UserEntity])],
})
export class UserModule {}
