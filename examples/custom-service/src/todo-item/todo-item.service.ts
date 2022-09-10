import {
  DeepPartial,
  DeleteManyResponse,
  Filter,
  InjectQueryService,
  NoOpQueryService,
  Query,
  QueryService,
  UpdateManyResponse
} from '@ptc-org/nestjs-query-core'

import { TodoItemDTO } from './dto/todo-item.dto'
import { TodoItemInputDTO } from './dto/todo-item-input.dto'
import { TodoItemEntity } from './todo-item.entity'

export class TodoItemService extends NoOpQueryService<TodoItemDTO, TodoItemInputDTO> {
  constructor(@InjectQueryService(TodoItemEntity) private readonly queryService: QueryService<TodoItemEntity>) {
    super()
  }

  createOne({ name: title, isCompleted: completed }: TodoItemInputDTO): Promise<TodoItemDTO> {
    return this.queryService.createOne({ title, completed })
  }

  createMany(items: TodoItemInputDTO[]): Promise<TodoItemDTO[]> {
    const newItems = items.map(({ name: title, isCompleted: completed }) => ({ title, completed }))
    return this.queryService.createMany(newItems)
  }

  query(query: Query<TodoItemDTO>): Promise<TodoItemDTO[]> {
    return this.queryService.query(query)
  }

  findById(id: string | number): Promise<TodoItemDTO | undefined> {
    return this.queryService.findById(id)
  }

  getById(id: string | number): Promise<TodoItemDTO> {
    return this.queryService.getById(id)
  }

  updateMany(update: DeepPartial<TodoItemDTO>, filter: Filter<TodoItemDTO>): Promise<UpdateManyResponse> {
    return this.queryService.updateMany(update, filter)
  }

  updateOne(id: string | number, update: DeepPartial<TodoItemDTO>): Promise<TodoItemDTO> {
    return this.queryService.updateOne(id, update)
  }

  deleteMany(filter: Filter<TodoItemDTO>): Promise<DeleteManyResponse> {
    return this.queryService.deleteMany(filter)
  }

  deleteOne(id: string | number): Promise<TodoItemDTO> {
    return this.queryService.deleteOne(id)
  }
}
