import { Assembler, ClassTransformerAssembler } from '@ptc-org/nestjs-query-core'

import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemEntity } from './todo-item.entity'

@Assembler(TodoItemDTO, TodoItemEntity)
export class TodoItemAssembler extends ClassTransformerAssembler<TodoItemDTO, TodoItemEntity> {
  convertToDTO(entity: TodoItemEntity): TodoItemDTO {
    const dto = super.convertToDTO(entity)
    dto.age = Date.now() - entity.createdAt.getMilliseconds()
    return dto
  }
}
