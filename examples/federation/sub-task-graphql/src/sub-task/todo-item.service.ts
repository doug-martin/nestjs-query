import { InjectQueryService, QueryService, RelationQueryService } from '@ptc-org/nestjs-query-core'

import { TodoItemReferenceDTO } from './dto/todo-item-reference.dto'
import { SubTaskEntity } from './sub-task.entity'

@QueryService(TodoItemReferenceDTO)
export class TodoItemService extends RelationQueryService<TodoItemReferenceDTO> {
  constructor(@InjectQueryService(SubTaskEntity) readonly subTaskService: QueryService<SubTaskEntity>) {
    super({
      // the name of the relation
      subTasks: {
        // the service to delegate to when looking up the relations
        service: subTaskService,
        // a query factory that will take in the reference to create a query.
        query: (todoItemReferenceDTO) => ({ filter: { todoItemId: { eq: todoItemReferenceDTO.id } } })
      }
    })
  }
}
