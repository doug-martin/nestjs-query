import { QueryService, RelationQueryService } from '@nestjs-query/core';
import { InjectTypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { TodoItemDTO } from './dto/todo-item.dto';
import { SubTaskEntity } from './sub-task.entity';

@QueryService(TodoItemDTO)
export class TodoItemService extends RelationQueryService<TodoItemDTO> {
  constructor(@InjectTypeOrmQueryService(SubTaskEntity) readonly subTaskService: QueryService<SubTaskEntity>) {
    super({
      subTasks: {
        service: subTaskService,
        query: (todoItemDTO) => ({ filter: { todoItemId: { eq: todoItemDTO.id } } }),
      },
    });
  }
}
