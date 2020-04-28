import { NestjsQuerySequelizeModule } from '@nestjs-query/query-sequelize';
import { Module } from '@nestjs/common';
import { TagEntity } from './tag.entity';
import { TagResolver } from './tag.resolver';

@Module({
  providers: [TagResolver],
  imports: [NestjsQuerySequelizeModule.forFeature([TagEntity])],
})
export class TagModule {}
