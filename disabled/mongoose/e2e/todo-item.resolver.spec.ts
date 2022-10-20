import { INestApplication, ValidationPipe } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { AggregateResponse, getQueryServiceToken, QueryService } from '@ptc-org/nestjs-query-core'
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql'
import { Types } from 'mongoose'
import request from 'supertest'

import { AppModule } from '../src/app.module'
import { config } from '../src/config'
import { AUTH_HEADER_NAME, USER_HEADER_NAME } from '../src/constants'
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto'
import { TagDTO } from '../src/tag/dto/tag.dto'
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto'
import { TodoItemEntity } from '../src/todo-item/todo-item.entity'
import { refresh, TODO_ITEMS } from './fixtures'
import {
  edgeNodes,
  pageInfoField,
  subTaskAggregateFields,
  subTaskFields,
  tagAggregateFields,
  tagFields,
  todoItemAggregateFields,
  todoItemFields
} from './graphql-fragments'

describe('TodoItemResolver (mongoose - e2e)', () => {
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
    await refresh(app.get(getConnectionToken()))
  })

  afterEach(() => refresh(app.get(getConnectionToken())))

  const todoItemIds = TODO_ITEMS.map((td) => td.id)
  const graphqlIds = todoItemIds.map((id) => `"${id}"`)
  describe('find one', () => {
    it(`should find a todo item by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: ${graphqlIds[0]}) {
            ${todoItemFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              todoItem: {
                id: todoItemIds[0],
                title: 'Create Nest App',
                completed: true,
                description: null,
                age: expect.any(Number)
              }
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
          todoItem(id: "${new Types.ObjectId().toString()}") {
            ${todoItemFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toContain('Unable to find')
        }))

    it(`should return subTasks as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: ${graphqlIds[0]}) {
            subTasks(sorting: { field: id, direction: ASC }) {
              ${pageInfoField}
              ${edgeNodes(subTaskFields)}
              totalCount
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.todoItem.subTasks
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(3)
          expect(edges).toHaveLength(3)
          edges.forEach((e) => expect(e.node.title).toContain('Create Nest App -'))
        }))

    it(`should return subTasksAggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: ${graphqlIds[0]}) {
            subTasksAggregate {
              ${subTaskAggregateFields}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO>[] = body.data.todoItem.subTasksAggregate
          expect(agg).toEqual([
            {
              count: { completed: 3, description: 0, id: 3, title: 3 },
              max: { description: null, id: '5f74ed936c3afaeaadb8f31c', title: 'Create Nest App - Sub Task 3' },
              min: { description: null, id: '5f74ed936c3afaeaadb8f31a', title: 'Create Nest App - Sub Task 1' }
            }
          ])
        }))

    it(`should return tags as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: ${graphqlIds[0]}) {
            tags(sorting: [{ field: id, direction: ASC }]) {
              ${pageInfoField}
              ${edgeNodes(tagFields)}
              totalCount
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.todoItem.tags
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(2)
          expect(edges).toHaveLength(2)
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home'])
        }))

    it(`should return tagsAggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: ${graphqlIds[0]}) {
            tagsAggregate {
              ${tagAggregateFields}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO>[] = body.data.todoItem.tagsAggregate
          expect(agg).toEqual([
            {
              count: { createdAt: 2, id: 2, name: 2, updatedAt: 2 },
              max: { id: '5f74ed2686b2bae7bf4b4aac', name: 'Urgent' },
              min: { id: '5f74ed2686b2bae7bf4b4aab', name: 'Home' }
            }
          ])
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
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjEifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19'
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node)).toEqual([
            {
              id: todoItemIds[0],
              title: 'Create Nest App',
              completed: true,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[1],
              title: 'Create Entity',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[2],
              title: 'Create Entity Service',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[3],
              title: 'Add Todo Item Resolver',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[4],
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number)
            }
          ])
        }))

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: [${graphqlIds.slice(0, 3).join(',')}] } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWYifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19'
          })
          expect(totalCount).toBe(3)
          expect(edges).toHaveLength(3)
          expect(edges.map((e) => e.node)).toEqual([
            {
              id: todoItemIds[0],
              title: 'Create Nest App',
              completed: true,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[1],
              title: 'Create Entity',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[2],
              title: 'Create Entity Service',
              completed: false,
              description: null,
              age: expect.any(Number)
            }
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
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjEifV19'
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node)).toEqual([
            {
              id: todoItemIds[4],
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[3],
              title: 'Add Todo Item Resolver',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[2],
              title: 'Create Entity Service',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[1],
              title: 'Create Entity',
              completed: false,
              description: null,
              age: expect.any(Number)
            },
            {
              id: todoItemIds[0],
              title: 'Create Nest App',
              completed: true,
              description: null,
              age: expect.any(Number)
            }
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
            totalCount
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWUifV19',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19'
            })
            expect(totalCount).toBe(5)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual([
              {
                id: todoItemIds[0],
                title: 'Create Nest App',
                completed: true,
                description: null,
                age: expect.any(Number)
              },
              {
                id: todoItemIds[1],
                title: 'Create Entity',
                completed: false,
                description: null,
                age: expect.any(Number)
              }
            ])
          }))

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {first: 2, after: "eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWUifV19"}) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
            totalCount
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjAifV19',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWYifV19'
            })
            expect(totalCount).toBe(5)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual([
              {
                id: todoItemIds[2],
                title: 'Create Entity Service',
                completed: false,
                description: null,
                age: expect.any(Number)
              },
              {
                id: todoItemIds[3],
                title: 'Add Todo Item Resolver',
                completed: false,
                description: null,
                age: expect.any(Number)
              }
            ])
          }))
    })
  })

  describe('aggregate', () => {
    it('should require a header secret', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
            todoItemAggregate {
              ${todoItemAggregateFields}
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))

    it(`should return a aggregate response`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          todoItemAggregate {
              ${todoItemAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate
          expect(res).toEqual([
            {
              count: { completed: 5, createdAt: 5, description: 0, id: 5, title: 5, updatedAt: 5 },
              max: { description: null, id: todoItemIds[4], title: 'How to create item With Sub Tasks' },
              min: { description: null, id: todoItemIds[0], title: 'Add Todo Item Resolver' }
            }
          ])
        }))

    it(`should return a aggregate response with groupBy`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          todoItemAggregate {
              groupBy {
                completed
              }
              ${todoItemAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate
          expect(res).toEqual([
            {
              groupBy: { completed: false },
              count: { completed: 4, createdAt: 4, description: 0, id: 4, title: 4, updatedAt: 4 },
              max: { description: null, id: todoItemIds[4], title: 'How to create item With Sub Tasks' },
              min: { description: null, id: todoItemIds[1], title: 'Add Todo Item Resolver' }
            },
            {
              groupBy: { completed: true },
              count: { completed: 1, createdAt: 1, description: 0, id: 1, title: 1, updatedAt: 1 },
              max: { description: null, id: todoItemIds[0], title: 'Create Nest App' },
              min: { description: null, id: todoItemIds[0], title: 'Create Nest App' }
            }
          ])
        }))

    it(`should allow filtering`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          todoItemAggregate(filter: { completed: { is: false } }) {
              ${todoItemAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate
          expect(res).toEqual([
            {
              count: { id: 4, title: 4, description: 0, completed: 4, createdAt: 4, updatedAt: 4 },
              min: { id: todoItemIds[1], title: 'Add Todo Item Resolver', description: null },
              max: { id: todoItemIds[4], title: 'How to create item With Sub Tasks', description: null }
            }
          ])
        }))
  })

  describe('create one', () => {
    it('should require a header secret', () =>
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
              completed
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))
    it('should allow creating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createOneTodoItem: {
                id: expect.any(String),
                title: 'Test Todo',
                completed: false
              }
            }
          })
        }))

    it('should call the beforeCreateOne hook', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test'
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTodoItem(
              input: {
                todoItem: { title: "Create One Hook Todo", completed: false }
              }
            ) {
              id
              title
              completed
              createdBy
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createOneTodoItem: {
                id: expect.any(String),
                title: 'Create One Hook Todo',
                completed: false,
                createdBy: 'E2E Test'
              }
            }
          })
        }))

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
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
    it('should require a header secret', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTodoItems(
              input: {
                todoItems: [{ title: "Test Todo", completed: false }]
              }
            ) {
              id
              title
              completed
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))

    it('should allow creating multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createManyTodoItems: [
                { id: expect.any(String), title: 'Many Test Todo 1', completed: false },
                { id: expect.any(String), title: 'Many Test Todo 2', completed: true }
              ]
            }
          })
        }))

    it('should call the beforeCreateMany hook when creating multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test'
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTodoItems(
              input: {
                todoItems: [
                  { title: "Many Create Hook 1", completed: false },
                  { title: "Many Create Hook 2", completed: true }
                ]
              }
            ) {
              id
              title
              completed
              createdBy
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createManyTodoItems: [
                { id: expect.any(String), title: 'Many Create Hook 1', completed: false, createdBy: 'E2E Test' },
                { id: expect.any(String), title: 'Many Create Hook 2', completed: true, createdBy: 'E2E Test' }
              ]
            }
          })
        }))

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
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
    it('should require a header secret', () =>
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
              completed
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: ${graphqlIds[0]},
                update: { title: "Update Test Todo", completed: true }
              }
            ) {
              id
              title
              completed
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneTodoItem: {
              id: todoItemIds[0],
              title: 'Update Test Todo',
              completed: true
            }
          }
        }))

    it('should call the beforeUpdateOne hook', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test'
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: ${graphqlIds[0]},
                update: { title: "Update One Hook Todo", completed: true }
              }
            ) {
              id
              title
              completed
              updatedBy
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneTodoItem: {
              id: todoItemIds[0],
              title: 'Update One Hook Todo',
              completed: true,
              updatedBy: 'E2E Test'
            }
          }
        }))

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
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
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: ${graphqlIds[0]},
                update: { title: "Update Test Todo With A Really Long Title" }
              }
            ) {
              id
              title
              completed
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
    it('should require a header secret', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: { id: { in: [${graphqlIds.slice(0, 2).join(',')}] } },
                update: { title: "Update Test Todo", completed: true }
              }
            ) {
              updatedCount
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: [${graphqlIds.slice(0, 2).join(',')}] } },
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

    it('should call the beforeUpdateMany hook when updating todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test'
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: [${graphqlIds.slice(0, 2).join(',')}] } },
                update: { title: "Update Many Hook", completed: true }
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
        })
        .then(async () => {
          const queryService = app.get<QueryService<TodoItemEntity>>(getQueryServiceToken(TodoItemEntity))
          const todoItems = await queryService.query({ filter: { id: { in: todoItemIds.slice(0, 2) } } })
          expect(
            todoItems.map((ti) => ({
              id: ti.id,
              title: ti.title,
              completed: ti.completed,
              updatedBy: ti.updatedBy
            }))
          ).toEqual([
            { id: todoItemIds[0], title: 'Update Many Hook', completed: true, updatedBy: 'E2E Test' },
            { id: todoItemIds[1], title: 'Update Many Hook', completed: true, updatedBy: 'E2E Test' }
          ])
        }))

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
        .set(AUTH_HEADER_NAME, config.auth.header)
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
    it('should require a header secret', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { id: ${graphqlIds[0]} }
            ) {
              id
              title
              completed
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))
    it('should allow deleting a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { id: ${graphqlIds[0]} }
            ) {
              id
              title
              completed
            }
        }`
        })
        .expect(200, {
          data: {
            deleteOneTodoItem: {
              id: todoItemIds[0],
              title: 'Create Nest App',
              completed: true
            }
          }
        }))

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { }
            ) {
              id
              title
              completed
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
    it('should require a header secret', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: {id: { in: [${graphqlIds.slice(0, 2).join(',')}]} },
              }
            ) {
              deletedCount
            }
        }`
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource')
        }))
    it('should allow deleting multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: {id: { in: [${graphqlIds.slice(0, 2).join(',')}]} },
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
        .set(AUTH_HEADER_NAME, config.auth.header)
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
        .set(AUTH_HEADER_NAME, config.auth.header)
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

  describe('addTagsToTodoItem', () => {
    it('allow adding tags to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addTagsToTodoItem(
              input: {
                id: ${graphqlIds[0]},
                relationIds: ["5f74ed2686b2bae7bf4b4aad", "5f74ed2686b2bae7bf4b4aae", "5f74ed2686b2bae7bf4b4aaf"]
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
                totalCount
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.addTagsToTodoItem.tags
          expect(body.data.addTagsToTodoItem.id).toBe(todoItemIds[0])
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home', 'Work', 'Question', 'Blocked'])
        }))
  })

  describe('removeTagsFromTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            removeTagsFromTodoItem(
              input: {
                id: ${graphqlIds[0]},
                relationIds: ["5f74ed2686b2bae7bf4b4aad", "5f74ed2686b2bae7bf4b4aae", "5f74ed2686b2bae7bf4b4aaf"]
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
                totalCount
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.removeTagsFromTodoItem.tags
          expect(body.data.removeTagsFromTodoItem.id).toBe(todoItemIds[0])
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(2)
          expect(edges).toHaveLength(2)
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home'])
        }))
  })

  describe('setTagsOnTodoItem', () => {
    it('allow settings tags on a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            setTagsOnTodoItem(
              input: {
                id: ${graphqlIds[0]},
                relationIds: ["5f74ed2686b2bae7bf4b4aab", "5f74ed2686b2bae7bf4b4aac", "5f74ed2686b2bae7bf4b4aad", "5f74ed2686b2bae7bf4b4aae", "5f74ed2686b2bae7bf4b4aaf"]
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
                totalCount
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.setTagsOnTodoItem.tags
          expect(body.data.setTagsOnTodoItem.id).toBe(todoItemIds[0])
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home', 'Work', 'Question', 'Blocked'])
        }))

    it('allow settings tags to a todoItem to an empty array', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            setTagsOnTodoItem(
              input: {
                id: ${graphqlIds[0]},
                relationIds: []
              }
            ) {
              id
              title
              tags(sorting: [{ field: id, direction: ASC }]) {
                ${pageInfoField}
                ${edgeNodes(tagFields)}
                totalCount
              }
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.setTagsOnTodoItem.tags
          expect(body.data.setTagsOnTodoItem.id).toBe(todoItemIds[0])
          expect(pageInfo).toEqual({
            endCursor: null,
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: null
          })
          expect(totalCount).toBe(0)
          expect(edges).toHaveLength(0)
          expect(edges.map((e) => e.node.name)).toEqual([])
        }))
  })

  afterAll(async () => {
    await app.close()
  })
})
