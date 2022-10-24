import { getConnectionToken } from '@m8a/nestjs-typegoose'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AggregateResponse } from '@ptc-org/nestjs-query-core'
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql'
import { Types } from 'mongoose'
import request from 'supertest'

import { AppModule } from '../src/app.module'
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto'
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto'
import { refresh, SUB_TASKS, TODO_ITEMS } from './fixtures'
import { edgeNodes, pageInfoField, subTaskAggregateFields, subTaskFields, todoItemFields } from './graphql-fragments'

describe('SubTaskResolver (typegoose - e2e)', () => {
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

  const toGraphqlSubTask = (subTask: any): Partial<SubTaskDTO> => ({
    id: subTask.id,
    description: subTask.description,
    title: subTask.title,
    completed: subTask.completed
  })

  const toGraphqlSubTasks = (subTasks: any[]): Partial<SubTaskDTO>[] => subTasks.map((st) => toGraphqlSubTask(st))

  const subTaskIds = SUB_TASKS.map((td) => td.id)
  const graphqlIds = subTaskIds.map((id) => `"${id}"`)

  describe('find one', () => {
    it(`should find a sub task by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: "${SUB_TASKS[0].id}") {
            ${subTaskFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              subTask: {
                id: SUB_TASKS[0].id,
                title: 'Create Nest App - Sub Task 1',
                completed: true,
                description: null
              }
            }
          })
        }))

    it(`should throw item not found on non existing sub task`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: "${new Types.ObjectId().toString()}") {
            ${subTaskFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toContain('Unable to find')
        }))

    it(`should return a todo item`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: "${SUB_TASKS[0].id}") {
            todoItem {
              ${todoItemFields}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              subTask: {
                todoItem: {
                  id: TODO_ITEMS[0].id,
                  title: 'Create Nest App',
                  completed: true,
                  description: null,
                  age: expect.any(Number)
                }
              }
            }
          })
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
          subTasks {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMjMifV19',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWEifV19'
          })
          expect(totalCount).toBe(15)
          expect(edges).toHaveLength(10)
          expect(edges.map((e) => e.node)).toEqual(toGraphqlSubTasks(SUB_TASKS.slice(0, 10)))
        }))

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks(filter: { id: { in: [${graphqlIds.slice(0, 3).join(',')}] } }) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWMifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWEifV19'
          })
          expect(totalCount).toBe(3)
          expect(edges).toHaveLength(3)
          expect(edges.map((e) => e.node)).toEqual(toGraphqlSubTasks(SUB_TASKS.slice(0, 3)))
        }))

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWYifV19',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMjgifV19'
          })
          expect(totalCount).toBe(15)
          expect(edges).toHaveLength(10)
          expect(edges.map((e) => e.node)).toEqual(toGraphqlSubTasks(SUB_TASKS.slice().reverse().slice(0, 10)))
        }))

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          subTasks(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWIifV19',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWEifV19'
            })
            expect(totalCount).toBe(15)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual(toGraphqlSubTasks(SUB_TASKS.slice(0, 2)))
          }))

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          subTasks(paging: {first: 2, after: "eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWIifV19"}) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWQifV19',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQ5MzZjM2FmYWVhYWRiOGYzMWMifV19'
            })
            expect(totalCount).toBe(15)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual(toGraphqlSubTasks(SUB_TASKS.slice(2, 4)))
          }))
    })
  })

  describe('aggregate', () => {
    it(`should return a aggregate response`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          subTaskAggregate {
              ${subTaskAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.subTaskAggregate
          expect(res).toEqual([
            {
              count: { id: 15, title: 15, description: 0, completed: 15 },
              min: {
                id: SUB_TASKS[0].id,
                title: 'Add Todo Item Resolver - Sub Task 1',
                description: null
              },
              max: {
                id: SUB_TASKS[SUB_TASKS.length - 1].id,
                title: 'How to create item With Sub Tasks - Sub Task 3',
                description: null
              }
            }
          ])
        }))

    it(`should allow filtering`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          subTaskAggregate(filter: {completed: {is: true}}) {
              ${subTaskAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.subTaskAggregate
          expect(res).toEqual([
            {
              count: { id: 5, title: 5, description: 0, completed: 5 },
              min: { id: SUB_TASKS[0].id, title: 'Add Todo Item Resolver - Sub Task 1', description: null },
              max: {
                id: SUB_TASKS[12].id,
                title: 'How to create item With Sub Tasks - Sub Task 1',
                description: null
              }
            }
          ])
        }))
  })

  describe('create one', () => {
    it('should allow creating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneSubTask(
              input: {
                subTask: { title: "Test SubTask", completed: false, todoItem: "${TODO_ITEMS[0].id}" }
              }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createOneSubTask: {
                id: expect.any(String),
                title: 'Test SubTask',
                description: null,
                completed: false
              }
            }
          })
        }))

    it('should validate a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneSubTask(
              input: {
                subTask: { title: "", completed: false, todoItem: "${TODO_ITEMS[0].id}" }
              }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty')
        }))
  })

  describe('create many', () => {
    it('should allow creating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManySubTasks(
              input: {
                subTasks: [
                  { title: "Test Create Many SubTask - 1", completed: false, todoItem: "${TODO_ITEMS[0].id}" },
                  { title: "Test Create Many SubTask - 2", completed: true, todoItem: "${TODO_ITEMS[0].id}" },
                ]
              }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createManySubTasks: [
                {
                  id: expect.any(String),
                  title: 'Test Create Many SubTask - 1',
                  description: null,
                  completed: false
                },
                {
                  id: expect.any(String),
                  title: 'Test Create Many SubTask - 2',
                  description: null,
                  completed: true
                }
              ]
            }
          })
        }))

    it('should validate a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManySubTasks(
              input: {
                subTasks: [{ title: "", completed: false, todoItem: "2" }]
              }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty')
        }))
  })

  describe('update one', () => {
    it('should allow updating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneSubTask(
              input: {
                id: ${graphqlIds[0]},
                update: { title: "Update Test Sub Task", completed: true }
              }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneSubTask: {
              id: subTaskIds[0],
              title: 'Update Test Sub Task',
              description: null,
              completed: true
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
            updateOneSubTask(
              input: {
                update: { title: "Update Test Sub Task" }
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
          expect(body.errors[0].message).toBe('Field "UpdateOneSubTaskInput.id" of required type "ID!" was not provided.')
        }))

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneSubTask(
              input: {
                id: "16",
                update: { title: "" }
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
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty')
        }))
  })

  describe('update many', () => {
    it('should allow updating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManySubTasks(
              input: {
                filter: {id: { in: [${graphqlIds[0]}, ${graphqlIds[1]}]} },
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200, {
          data: {
            updateManySubTasks: {
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
            updateManySubTasks(
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
            'Field "UpdateManySubTasksInput.filter" of required type "SubTaskUpdateFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManySubTasks(
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
    it('should allow deleting a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneSubTask(
              input: { id: ${graphqlIds[0]} }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              deleteOneSubTask: toGraphqlSubTask(SUB_TASKS[0])
            }
          })
        }))

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneSubTask(
              input: { }
            ) {
              ${subTaskFields}
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "DeleteOneSubTaskInput.id" of required type "ID!" was not provided.')
        }))
  })

  describe('delete many', () => {
    it('should allow updating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManySubTasks(
              input: {
                filter: {id: { in: [${graphqlIds[0]}, ${graphqlIds[1]}]} },
              }
            ) {
              deletedCount
            }
        }`
        })
        .expect(200, {
          data: {
            deleteManySubTasks: {
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
            deleteManySubTasks(
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
            'Field "DeleteManySubTasksInput.filter" of required type "SubTaskDeleteFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManySubTasks(
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

  describe('setTodoItemOnSubTask', () => {
    it('should set a the todoItem on a subtask', () => {
      const todoItem = TODO_ITEMS[1]
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
          setTodoItemOnSubTask(input: { id: ${graphqlIds[0]}, relationId: "${TODO_ITEMS[1].id}" }) {
            id
            title
            todoItem {
              ${todoItemFields}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              setTodoItemOnSubTask: {
                id: subTaskIds[0],
                title: SUB_TASKS[0].title,
                todoItem: {
                  id: todoItem.id,
                  title: todoItem.title,
                  completed: todoItem.completed,
                  description: null,
                  age: expect.any(Number)
                }
              }
            }
          })
        })
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
