import { QueryService } from '@nestjs-query/core';
import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagTodoItemDTO } from './dto/tag-todo-item.dto';
import { TagDTO } from './dto/tag.dto';
import { TagEntity } from './tag.entity';

@Resolver(() => TagDTO)
export class TagResolver extends CRUDResolver(TagDTO, {
  CreateDTOClass: TagInputDTO,
  UpdateDTOClass: TagInputDTO,
  relations: {
    many: {
      tagTodoItems: { DTO: TagTodoItemDTO },
    },
  },
}) {
  constructor(@InjectTypeOrmQueryService(TagEntity) readonly service: QueryService<TagEntity>) {
    super(service);
  }
}
