import { InjectQueryService, QueryService, RelationQueryService } from '@ptc-org/nestjs-query-core'

import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto'
import { TagTodoItemEntity } from './tag-todo-item.entity'

@QueryService(TodoItemReferenceDTO)
export class TodoItemService extends RelationQueryService<TodoItemReferenceDTO> {
  constructor(@InjectQueryService(TagTodoItemEntity) readonly tagTodoItemService: QueryService<TagTodoItemEntity>) {
    super({
      tagTodoItems: {
        service: tagTodoItemService,
        query: (ref: TodoItemReferenceDTO) => ({ filter: { todoItemId: { eq: ref.id } } })
      }
    })
  }
}
