import { Connection } from 'typeorm'

import { executeTruncate } from '../../helpers'
import { SubTaskEntity } from '../src/sub-task/sub-task.entity'
import { TagEntity } from '../src/tag/tag.entity'
import { TodoItemEntity } from '../src/todo-item/todo-item.entity'
import { UserEntity } from '../src/user/user.entity'

const tables = ['todo_item', 'sub_task', 'tag', 'user']
export const truncate = async (connection: Connection): Promise<void> => executeTruncate(connection, tables)

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection)

  const userRepo = connection.getRepository(UserEntity)
  const todoRepo = connection.getRepository(TodoItemEntity)
  const subTaskRepo = connection.getRepository(SubTaskEntity)
  const tagsRepo = connection.getRepository(TagEntity)

  const users = await userRepo.save([
    { username: 'nestjs-query', password: '123' },
    { username: 'nestjs-query-2', password: '123' },
    { username: 'nestjs-query-3', password: '123' }
  ])

  const urgentTag = await tagsRepo.save({ name: 'Urgent' })
  const homeTag = await tagsRepo.save({ name: 'Home' })
  const workTag = await tagsRepo.save({ name: 'Work' })
  const questionTag = await tagsRepo.save({ name: 'Question' })
  const blockedTag = await tagsRepo.save({ name: 'Blocked' })

  const todoItems: TodoItemEntity[] = await users.reduce(async (prev, user) => {
    const allTodos = await prev
    const userTodos = await todoRepo.save([
      { title: 'Create Nest App', completed: true, priority: 0, tags: [urgentTag, homeTag], owner: user },
      { title: 'Create Entity', completed: false, priority: 1, tags: [urgentTag, workTag], owner: user },
      { title: 'Create Entity Service', completed: false, priority: 2, tags: [blockedTag, workTag], owner: user },
      { title: 'Add Todo Item Resolver', completed: false, priority: 3, tags: [blockedTag, homeTag], owner: user },
      {
        title: 'How to create item With Sub Tasks',
        completed: false,
        priority: 4,
        tags: [questionTag, blockedTag],
        owner: user
      }
    ])
    return [...allTodos, ...userTodos]
  }, Promise.resolve([] as TodoItemEntity[]))

  await subTaskRepo.save(
    todoItems.reduce(
      (subTasks, todo) => [
        ...subTasks,
        { completed: true, title: `${todo.title} - Sub Task 1`, todoItem: todo, ownerId: todo.ownerId },
        { completed: false, title: `${todo.title} - Sub Task 2`, todoItem: todo, ownerId: todo.ownerId },
        { completed: false, title: `${todo.title} - Sub Task 3`, todoItem: todo, ownerId: todo.ownerId }
      ],
      [] as Partial<SubTaskEntity>[]
    )
  )
}
