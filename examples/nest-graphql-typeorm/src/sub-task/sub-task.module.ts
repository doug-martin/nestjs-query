import { NestjsQueryTypeOrmModule } from '@nestjs-query/query-typeorm';
import { Module } from '@nestjs/common';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskResolver } from './sub-task.resolver';

@Module({
  providers: [SubTaskResolver],
  imports: [NestjsQueryTypeOrmModule.forFeature([SubTaskEntity])],
})
export class SubTaskModule {}
