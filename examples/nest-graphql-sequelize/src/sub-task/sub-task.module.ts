import { NestjsQuerySequelizeModule } from '@nestjs-query/query-sequelize';
import { Module } from '@nestjs/common';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskResolver } from './sub-task.resolver';

@Module({
  providers: [SubTaskResolver],
  imports: [NestjsQuerySequelizeModule.forFeature([SubTaskEntity])],
})
export class SubTaskModule {}
