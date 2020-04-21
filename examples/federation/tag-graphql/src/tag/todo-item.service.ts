import { QueryService, RelationQueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TodoItemDTO } from './dto/todo-item.dto';
import { TagTodoItemEntity } from './tag-todo-item.entity';

@QueryService(TodoItemDTO)
export class TodoItemService extends RelationQueryService<TodoItemDTO> {
  constructor(
    @InjectTypeOrmQueryService(TagTodoItemEntity) readonly tagTodoItemService: QueryService<TagTodoItemEntity>,
  ) {
    super({
      tagTodoItems: {
        service: tagTodoItemService,
        query: (todoItemDTO: TodoItemDTO) => ({ filter: { todoItemId: { eq: todoItemDTO.id } } }),
      },
    });
  }
}
