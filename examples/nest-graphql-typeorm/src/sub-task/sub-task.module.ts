import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubTaskEntity } from './sub-task.entity';
import { SubTaskResolver } from './sub-task.resolver';
import { SubTaskService } from './sub-task.service';

@Module({
  providers: [SubTaskResolver, SubTaskService],
  imports: [TypeOrmModule.forFeature([SubTaskEntity])],
})
export class SubTaskModule {}
