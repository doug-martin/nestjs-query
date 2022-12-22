import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql'
import request from 'supertest'
import { Connection } from 'typeorm'

import { AppModule } from '../src/app.module'
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto'
import { TagDTO } from '../src/tag/dto/tag.dto'
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto'
import { refresh } from './fixtures'
import { edgeNodes, pageInfoField, subTaskFields, tagFields, todoItemFields } from './graphql-fragments'

describe('TodoItemResolver (basic - e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true
      })
    )

    await app.init()
    await refresh(app.get(Connection))
  })

  afterAll(() => refresh(app.get(Connection)))

  describe('find one', () => {
    it(`should find a todo item by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            ${todoItemFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              todoItem: { id: '1', title: 'Create Nest App', isCompleted: true, description: null }
            }
          })
        }))

    it(`should throw item not found on non existing todo item`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 100) {
            ${todoItemFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toContain('Unable to find')
        }))

    it(`should not include filter-only fields`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
            todoItem(id: 1) {
              ${todoItemFields}
              created
            }
          }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Cannot query field "created" on type "TodoItem".')
        }))

    it(`should return subTasks as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            subTasks(sorting: { field: id, direction: ASC }) {
              ${pageInfoField}
              ${edgeNodes(subTaskFields)}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<SubTaskDTO> = body.data.todoItem.subTasks
          expect(edges).toHaveLength(3)
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })

          edges.forEach((e) => expect(e.node.todoItemId).toBe('1'))
        }))

    it(`should return tags as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            tags(sorting: [{ field: id, direction: ASC }]) {
              ${pageInfoField}
              ${edgeNodes(tagFields)}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TagDTO> = body.data.todoItem.tags
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(2)

          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home'])
        }))
  })

  describe('query', () => {
    it(`should return a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(5)

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', isCompleted: true, description: null },
            { id: '2', title: 'Create Entity', isCompleted: false, description: null },
            { id: '3', title: 'Create Entity Service', isCompleted: false, description: null },
            { id: '4', title: 'Add Todo Item Resolver', isCompleted: false, description: null },
            { id: '5', title: 'How to create item With Sub Tasks', isCompleted: false, description: null }
          ])
        }))

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: [1, 2, 3] } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(3)

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', isCompleted: true, description: null },
            { id: '2', title: 'Create Entity', isCompleted: false, description: null },
            { id: '3', title: 'Create Entity Service', isCompleted: false, description: null }
          ])
        }))

    it(`should allow querying by filter-only fields`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {
            now: new Date().toISOString()
          },
          query: `query ($now: DateTime!) {
            todoItems(filter: { created: { lt: $now } }) {
              ${pageInfoField}
              ${edgeNodes(todoItemFields)}
            }
          }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(5)

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', isCompleted: true, description: null },
            { id: '2', title: 'Create Entity', isCompleted: false, description: null },
            { id: '3', title: 'Create Entity Service', isCompleted: false, description: null },
            { id: '4', title: 'Add Todo Item Resolver', isCompleted: false, description: null },
            { id: '5', title: 'How to create item With Sub Tasks', isCompleted: false, description: null }
          ])
        }))

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(5)

          expect(edges.map((e) => e.node)).toEqual([
            { id: '5', title: 'How to create item With Sub Tasks', isCompleted: false, description: null },
            { id: '4', title: 'Add Todo Item Resolver', isCompleted: false, description: null },
            { id: '3', title: 'Create Entity Service', isCompleted: false, description: null },
            { id: '2', title: 'Create Entity', isCompleted: false, description: null },
            { id: '1', title: 'Create Nest App', isCompleted: true, description: null }
          ])
        }))

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
            })
            expect(edges).toHaveLength(2)

            expect(edges.map((e) => e.node)).toEqual([
              { id: '1', title: 'Create Nest App', isCompleted: true, description: null },
              { id: '2', title: 'Create Entity', isCompleted: false, description: null }
            ])
          }))

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {first: 2, after: "YXJyYXljb25uZWN0aW9uOjE="}) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjI='
            })
            expect(edges).toHaveLength(2)

            expect(edges.map((e) => e.node)).toEqual([
              { id: '3', title: 'Create Entity Service', isCompleted: false, description: null },
              { id: '4', title: 'Add Todo Item Resolver', isCompleted: false, description: null }
            ])
          }))
    })
  })

  describe('create one', () => {
    it('should allow creating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTodoItem(
              input: {
                todoItem: { title: "Test Todo", completed: false }
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200, {
          data: {
            createOneTodoItem: {
              id: '6',
              title: 'Test Todo',
              isCompleted: false
            }
          }
        }))

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTodoItem(
              input: {
                todoItem: { title: "Test Todo with a too long title!", completed: false }
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters')
        }))
  })

  describe('create many', () => {
    it('should allow creating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTodoItems(
              input: {
                todoItems: [
                  { title: "Many Test Todo 1", completed: false },
                  { title: "Many Test Todo 2", completed: true }
                ]
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200, {
          data: {
            createManyTodoItems: [
              { id: '7', title: 'Many Test Todo 1', isCompleted: false },
              { id: '8', title: 'Many Test Todo 2', isCompleted: true }
            ]
          }
        }))

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTodoItems(
              input: {
                todoItems: [{ title: "Test Todo With A Really Long Title", completed: false }]
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters')
        }))
  })

  describe('update one', () => {
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "6",
                update: { title: "Update Test Todo", completed: true }
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneTodoItem: {
              id: '6',
              title: 'Update Test Todo',
              isCompleted: true
            }
          }
        }))

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                update: { title: "Update Test Todo With A Really Long Title" }
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "UpdateOneTodoItemInput.id" of required type "ID!" was not provided.')
        }))

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "6",
                update: { title: "Update Test Todo With A Really Long Title" }
              }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters')
        }))
  })

  describe('update many', () => {
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["7", "8"]} },
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 2
            }
          }
        }))

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe(
            'Field "UpdateManyTodoItemsInput.filter" of required type "TodoItemUpdateFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: { },
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object')
        }))
  })

  describe('delete one', () => {
    it('should allow deleting a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { id: "6" }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(200, {
          data: {
            deleteOneTodoItem: {
              id: null,
              title: 'Update Test Todo',
              isCompleted: true
            }
          }
        }))

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { }
            ) {
              id
              title
              isCompleted
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "DeleteOneTodoItemInput.id" of required type "ID!" was not provided.')
        }))
  })

  describe('delete many', () => {
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: {id: { in: ["7", "8"]} },
              }
            ) {
              deletedCount
            }
        }`
        })
        .expect(200, {
          data: {
            deleteManyTodoItems: {
              deletedCount: 2
            }
          }
        }))

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: { }
            ) {
              deletedCount
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe(
            'Field "DeleteManyTodoItemsInput.filter" of required type "TodoItemDeleteFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: { },
              }
            ) {
              deletedCount
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object')
        }))
  })

  describe('addSubTasksToTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addSubTasksToTodoItem(
              input: {
                id: 1,
                relationIds: ["4", "5", "6"]
              }
            ) {
              id
              title
              subTasks {
                ${pageInfoField}
                ${edgeNodes(subTaskFields)}
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<SubTaskDTO> = body.data.addSubTasksToTodoItem.subTasks
          expect(body.data.addSubTasksToTodoItem.id).toBe('1')
          expect(edges).toHaveLength(6)
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjU=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          edges.forEach((e) => expect(e.node.todoItemId).toBe('1'))
        }))
  })

  describe('addTagsToTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addTagsToTodoItem(
              input: {
                id: 1,
                relationIds: ["3", "4", "5"]
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TagDTO> = body.data.addTagsToTodoItem.tags
          expect(body.data.addTagsToTodoItem.id).toBe('1')
          expect(edges).toHaveLength(5)
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home', 'Work', 'Question', 'Blocked'])
        }))
  })

  describe('removeTagsFromTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            removeTagsFromTodoItem(
              input: {
                id: 1,
                relationIds: ["3", "4", "5"]
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TagDTO> = body.data.removeTagsFromTodoItem.tags
          expect(body.data.removeTagsFromTodoItem.id).toBe('1')
          expect(edges).toHaveLength(2)
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home'])
        }))
  })

  afterAll(async () => {
    await app.close()
  })
})
