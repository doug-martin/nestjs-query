import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TagDTO } from './dto/tag.dto';
import { TagEntity } from './tag.entity';

@QueryService(TagDTO)
export class TagService extends TypeOrmQueryService<TagDTO, TagEntity> {
  constructor(@InjectRepository(TagEntity) readonly repo: Repository<TagEntity>) {
    super(repo);
  }
}
