import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTaskDTO } from './dto/sub-task.dto';
import { SubTaskEntity } from './sub-task.entity';

@QueryService(SubTaskDTO)
export class SubTaskService extends TypeOrmQueryService<SubTaskDTO, SubTaskEntity> {
  constructor(@InjectRepository(SubTaskEntity) readonly repo: Repository<SubTaskEntity>) {
    super(repo);
  }
}
