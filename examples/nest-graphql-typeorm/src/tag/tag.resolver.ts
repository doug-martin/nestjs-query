import { CRUDResolver } from '@nestjs-query/query-graphql';
import { Resolver } from '@nestjs/graphql';
import { TodoItemDTO } from '../todo-item/dto/todo-item.dto';
import { TagInputDTO } from './dto/tag-input.dto';
import { TagDTO } from './dto/tag.dto';
import { TagService } from './tag.service';

@Resolver(() => TagDTO)
export class TagResolver extends CRUDResolver(TagDTO, {
  CreateDTOClass: TagInputDTO,
  UpdateDTOClass: TagInputDTO,
  relations: {
    many: {
      todoItems: { DTO: TodoItemDTO },
    },
  },
}) {
  constructor(readonly service: TagService) {
    super(service);
  }
}
