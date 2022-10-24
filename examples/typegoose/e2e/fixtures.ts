/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-assignment */
import { Connection, Types } from 'mongoose'

import { asyncLoop } from '../../helpers'
import { SubTaskEntity } from '../src/sub-task/sub-task.entity'
import { TagEntity } from '../src/tag/tag.entity'
import { TodoItemEntity } from '../src/todo-item/todo-item.entity'

const { ObjectId } = Types

export const TAGS = [
  { id: '5f74ed2686b2bae7bf4b4aab', name: 'Urgent' },
  { id: '5f74ed2686b2bae7bf4b4aac', name: 'Home' },
  { id: '5f74ed2686b2bae7bf4b4aad', name: 'Work' },
  { id: '5f74ed2686b2bae7bf4b4aae', name: 'Question' },
  { id: '5f74ed2686b2bae7bf4b4aaf', name: 'Blocked' }
]

export const TODO_ITEMS = [
  {
    id: '5f74af112fae2b251510e3ad',
    title: 'Create Nest App',
    completed: true,
    priority: 0,
    tags: [TAGS[0].id, TAGS[1].id]
  },
  {
    id: '5f74af112fae2b251510e3ae',
    title: 'Create Entity',
    completed: false,
    priority: 1,
    tags: [TAGS[0].id, TAGS[2].id]
  },
  {
    id: '5f74af112fae2b251510e3af',
    title: 'Create Entity Service',
    completed: false,
    priority: 2,
    tags: [TAGS[4].id, TAGS[2].id]
  },
  {
    id: '5f74af112fae2b251510e3b0',
    title: 'Add Todo Item Resolver',
    completed: false,
    priority: 3,
    tags: [TAGS[4].id, TAGS[1].id]
  },
  {
    id: '5f74af112fae2b251510e3b1',
    title: 'How to create item With Sub Tasks',
    completed: false,
    priority: 4,
    tags: [TAGS[3].id, TAGS[4].id]
  }
]

export const SUB_TASKS = [
  {
    id: '5f74ed936c3afaeaadb8f31a',
    completed: true,
    description: null,
    title: `${TODO_ITEMS[0].title} - Sub Task 1`,
    todoItem: TODO_ITEMS[0].id
  },
  {
    id: '5f74ed936c3afaeaadb8f31b',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[0].title} - Sub Task 2`,
    todoItem: TODO_ITEMS[0].id
  },
  {
    id: '5f74ed936c3afaeaadb8f31c',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[0].title} - Sub Task 3`,
    todoItem: TODO_ITEMS[0].id
  },
  {
    id: '5f74ed936c3afaeaadb8f31d',
    completed: true,
    description: null,
    title: `${TODO_ITEMS[1].title} - Sub Task 1`,
    todoItem: TODO_ITEMS[1].id
  },
  {
    id: '5f74ed936c3afaeaadb8f31e',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[1].title} - Sub Task 2`,
    todoItem: TODO_ITEMS[1].id
  },
  {
    id: '5f74ed936c3afaeaadb8f31f',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[1].title} - Sub Task 3`,
    todoItem: TODO_ITEMS[1].id
  },
  {
    id: '5f74ed936c3afaeaadb8f320',
    completed: true,
    description: null,
    title: `${TODO_ITEMS[2].title} - Sub Task 1`,
    todoItem: TODO_ITEMS[2].id
  },
  {
    id: '5f74ed936c3afaeaadb8f321',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[2].title} - Sub Task 2`,
    todoItem: TODO_ITEMS[2].id
  },
  {
    id: '5f74ed936c3afaeaadb8f322',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[2].title} - Sub Task 3`,
    todoItem: TODO_ITEMS[2].id
  },
  {
    id: '5f74ed936c3afaeaadb8f323',
    completed: true,
    description: null,
    title: `${TODO_ITEMS[3].title} - Sub Task 1`,
    todoItem: TODO_ITEMS[3].id
  },
  {
    id: '5f74ed936c3afaeaadb8f324',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[3].title} - Sub Task 2`,
    todoItem: TODO_ITEMS[3].id
  },
  {
    id: '5f74ed936c3afaeaadb8f325',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[3].title} - Sub Task 3`,
    todoItem: TODO_ITEMS[3].id
  },
  {
    id: '5f74ed936c3afaeaadb8f326',
    completed: true,
    description: null,
    title: `${TODO_ITEMS[4].title} - Sub Task 1`,
    todoItem: TODO_ITEMS[4].id
  },
  {
    id: '5f74ed936c3afaeaadb8f327',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[4].title} - Sub Task 2`,
    todoItem: TODO_ITEMS[4].id
  },
  {
    id: '5f74ed936c3afaeaadb8f328',
    completed: false,
    description: null,
    title: `${TODO_ITEMS[4].title} - Sub Task 3`,
    todoItem: TODO_ITEMS[4].id
  }
]

const documents = ['TodoItemEntity', 'SubTaskEntity', 'TagEntity']

export const truncate = async (connection: Connection): Promise<void> =>
  asyncLoop(documents, (document) => connection.model<TodoItemEntity | TagEntity | SubTaskEntity>(document).deleteMany({}).exec())

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection)

  const TodoModel = connection.model<TodoItemEntity>('TodoItemEntity')
  const TagsModel = connection.model<TagEntity>('TagEntity')
  const SubTaskModel = connection.model<SubTaskEntity>('SubTaskEntity')

  await Promise.all(TODO_ITEMS.map(({ id, ...rest }) => new TodoModel({ _id: ObjectId.createFromHexString(id), ...rest }).save()))

  await Promise.all(
    SUB_TASKS.map(({ id, ...rest }) => new SubTaskModel({ _id: ObjectId.createFromHexString(id), ...rest }).save())
  )

  await Promise.all(TAGS.map(({ id, ...rest }) => new TagsModel({ _id: ObjectId.createFromHexString(id), ...rest }).save()))
}
