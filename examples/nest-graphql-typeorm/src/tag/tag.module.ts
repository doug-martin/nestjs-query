import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { TagEntity } from './tag.entity';
import { TagResolver } from './tag.resolver';

@Module({
  providers: [TagResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([TagEntity])],
})
export class TagModule {}
