import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTaskEntity } from './sub-task.entity';

@Injectable()
export class SubTaskService extends TypeOrmQueryService<SubTaskEntity> {
  constructor(@InjectRepository(SubTaskEntity) repo: Repository<SubTaskEntity>) {
    super(repo);
  }
}
