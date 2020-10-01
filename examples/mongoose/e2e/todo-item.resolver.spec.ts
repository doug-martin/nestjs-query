import { AggregateResponse, getQueryServiceToken, QueryService } from '@nestjs-query/core';
import { CursorConnectionType } from '@nestjs-query/query-graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { config } from '../src/config';
import { AUTH_HEADER_NAME, USER_HEADER_NAME } from '../src/constants';
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto';
import { TagDTO } from '../src/tag/dto/tag.dto';
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto';
import { refresh } from './fixtures';
import {
  edgeNodes,
  pageInfoField,
  subTaskFields,
  tagFields,
  todoItemFields,
  todoItemAggregateFields,
  tagAggregateFields,
  subTaskAggregateFields,
} from './graphql-fragments';
import { TodoItemEntity } from '../src/todo-item/todo-item.entity';
import { getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

describe('TodoItemResolver (mongoose - e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true,
      }),
    );

    await app.init();
    await refresh(app.get(getConnectionToken()));
  });

  afterAll(() => refresh(app.get(getConnectionToken())));

  const todoItemId = '5f74af112fae2b251510e3ad'
  describe('find one', () => {
    it(`should find a todo item by id`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${todoItemId}") {
            ${todoItemFields}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              todoItem: {
                id: todoItemId,
                title: 'Create Nest App',
                completed: true,
                description: null,
                age: expect.any(Number),
              },
            },
          });
        });
    });

    it(`should return null if the todo item is not found`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${new Types.ObjectId().toString()}") {
            ${todoItemFields}
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItem: null,
          },
        });
    });

    it(`should return subTasks as a connection`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${todoItemId}") {
            subTasks(sorting: { field: id, direction: ASC }) {
              ${pageInfoField}
              ${edgeNodes(subTaskFields)}
              totalCount
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.todoItem.subTasks;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          edges.forEach((e) => expect(e.node.title).toContain('Create Nest App -'));
        });
    });

    it(`should return subTasksAggregate`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${todoItemId}") {
            subTasksAggregate {
              ${subTaskAggregateFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO> = body.data.todoItem.subTasksAggregate;
          expect(agg).toEqual({
            count: { completed: 3, description: 0, id: 3, title: 3 },
            max: { description: null, id: '5f74ed936c3afaeaadb8f31c', title: 'Create Nest App - Sub Task 3' },
            min: { description: null, id: '5f74ed936c3afaeaadb8f31a', title: 'Create Nest App - Sub Task 1' },
          });
        });
    });

    it(`should return tags as a connection`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${todoItemId}") {
            tags(sorting: [{ field: id, direction: ASC }]) {
              ${pageInfoField}
              ${edgeNodes(tagFields)}
              totalCount
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.todoItem.tags;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home']);
        });
    });

    it(`should return tagsAggregate`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: "${todoItemId}") {
            tagsAggregate {
              ${tagAggregateFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO> = body.data.todoItem.tagsAggregate;
          expect(agg).toEqual({
            count: { createdAt: 2, id: 2, name: 2, updatedAt: 2 },
            max: { id: '5f74ed2686b2bae7bf4b4aac', name: 'Urgent' },
            min: { id: '5f74ed2686b2bae7bf4b4aab', name: 'Home' },
          });
        });
    });
  });

  describe('query', () => {
    it(`should return a connection`, () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjEifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual([
            { id: '5f74af112fae2b251510e3ad', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3ae', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3af', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3b0', title: 'Add Todo Item Resolver', completed: false, description: null, age: expect.any(Number) },
            {
              id: '5f74af112fae2b251510e3b1',
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number),
            },
          ]);
        });
    });

    it(`should allow querying`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: ["5f74af112fae2b251510e3ad", "5f74af112fae2b251510e3ae", "5f74af112fae2b251510e3af"] } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWYifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual([
            { id: '5f74af112fae2b251510e3ad', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3ae', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3af', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
          ]);
        });
    });

    it(`should allow sorting`, () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjEifV19',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual([
            {
              id: '5f74af112fae2b251510e3b1',
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number),
            },
            { id: '5f74af112fae2b251510e3b0', title: 'Add Todo Item Resolver', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3af', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3ae', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '5f74af112fae2b251510e3ad', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
          ]);
        });
    });

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () => {
        return request(app.getHttpServer())
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
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
            expect(pageInfo).toEqual({
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWUifV19',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWQifV19',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual([
              { id: '5f74af112fae2b251510e3ad', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
              { id: '5f74af112fae2b251510e3ae', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            ]);
          });
      });

      it(`should allow paging with the 'first' field and 'after'`, () => {
        return request(app.getHttpServer())
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
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
            expect(pageInfo).toEqual({
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYjAifV19',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0YWYxMTJmYWUyYjI1MTUxMGUzYWYifV19',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual([
              { id: '5f74af112fae2b251510e3af', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
              {
                id: '5f74af112fae2b251510e3b0',
                title: 'Add Todo Item Resolver',
                completed: false,
                description: null,
                age: expect.any(Number),
              },
            ]);
          });
      });
    });
  });

  describe('aggregate', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
            todoItemAggregate {
              ${todoItemAggregateFields}
            }
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });

    it(`should return a aggregate response`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          todoItemAggregate {
              ${todoItemAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO> = body.data.todoItemAggregate;
          expect(res).toEqual({
            avg: { id: 3 },
            count: { completed: 5, created: 5, description: 0, id: 5, title: 5, updated: 5 },
            max: { description: null, id: '5', title: 'How to create item With Sub Tasks' },
            min: { description: null, id: '1', title: 'Add Todo Item Resolver' },
            sum: { id: 15 },
          });
        });
    });

    it(`should allow filtering`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          todoItemAggregate(filter: { completed: { is: false } }) {
              ${todoItemAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO> = body.data.todoItemAggregate;
          expect(res).toEqual({
            count: { id: 4, title: 4, description: 0, completed: 4, created: 4, updated: 4 },
            sum: { id: 14 },
            avg: { id: 3.5 },
            min: { id: '2', title: 'Add Todo Item Resolver', description: null },
            max: { id: '5', title: 'How to create item With Sub Tasks', description: null },
          });
        });
    });
  });

  describe('create one', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });
    it('should allow creating a todoItem', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200, {
          data: {
            createOneTodoItem: {
              id: '6',
              title: 'Test Todo',
              completed: false,
            },
          },
        });
    });

    it('should call the beforeCreateOne hook', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test',
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
        }`,
        })
        .expect(200, {
          data: {
            createOneTodoItem: {
              id: '7',
              title: 'Create One Hook Todo',
              completed: false,
              createdBy: 'E2E Test',
            },
          },
        });
    });

    it('should validate a todoItem', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters');
        });
    });
  });

  describe('create many', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });

    it('should allow creating multiple todoItems', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200, {
          data: {
            createManyTodoItems: [
              { id: '8', title: 'Many Test Todo 1', completed: false },
              { id: '9', title: 'Many Test Todo 2', completed: true },
            ],
          },
        });
    });

    it('should call the beforeCreateMany hook when creating multiple todoItems', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test',
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
        }`,
        })
        .expect(200, {
          data: {
            createManyTodoItems: [
              { id: '10', title: 'Many Create Hook 1', completed: false, createdBy: 'E2E Test' },
              { id: '11', title: 'Many Create Hook 2', completed: true, createdBy: 'E2E Test' },
            ],
          },
        });
    });

    it('should validate a todoItem', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters');
        });
    });
  });

  describe('update one', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });
    it('should allow updating a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
        }`,
        })
        .expect(200, {
          data: {
            updateOneTodoItem: {
              id: '6',
              title: 'Update Test Todo',
              completed: true,
            },
          },
        });
    });

    it('should call the beforeUpdateOne hook', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test',
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "7",
                update: { title: "Update One Hook Todo", completed: true }
              }
            ) {
              id
              title
              completed
              updatedBy
            }
        }`,
        })
        .expect(200, {
          data: {
            updateOneTodoItem: {
              id: '7',
              title: 'Update One Hook Todo',
              completed: true,
              updatedBy: 'E2E Test',
            },
          },
        });
    });

    it('should require an id', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe(
            'Field "UpdateOneTodoItemInput.id" of required type "ID!" was not provided.',
          );
        });
    });

    it('should validate an update', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
              completed
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('title must be shorter than or equal to 20 characters');
        });
    });
  });

  describe('update many', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["7", "8"]} },
                update: { title: "Update Test Todo", completed: true }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });
    it('should allow updating a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
        }`,
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 2,
            },
          },
        });
    });

    it('should call the beforeUpdateMany hook when updating todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set({
          [AUTH_HEADER_NAME]: config.auth.header,
          [USER_HEADER_NAME]: 'E2E Test',
        })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["10", "11"]} },
                update: { title: "Update Many Hook", completed: true }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 2,
            },
          },
        })
        .then(async () => {
          const queryService = app.get<QueryService<TodoItemEntity>>(getQueryServiceToken(TodoItemEntity));
          const todoItems = await queryService.query({ filter: { id: { in: [10, 11] } } });
          expect(
            todoItems.map((ti) => {
              return {
                id: ti.id,
                title: ti.title,
                completed: ti.completed,
                updatedBy: ti.updatedBy,
              };
            }),
          ).toEqual([
            { id: 10, title: 'Update Many Hook', completed: true, updatedBy: 'E2E Test' },
            { id: 11, title: 'Update Many Hook', completed: true, updatedBy: 'E2E Test' },
          ]);
        });
    });

    it('should require a filter', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe(
            'Field "UpdateManyTodoItemsInput.filter" of required type "TodoItemUpdateFilter!" was not provided.',
          );
        });
    });

    it('should require a non-empty filter', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object');
        });
    });
  });

  describe('delete one', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
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
              completed
            }
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });
    it('should allow deleting a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { id: "6" }
            ) {
              id
              title
              completed
            }
        }`,
        })
        .expect(200, {
          data: {
            deleteOneTodoItem: {
              id: null,
              title: 'Update Test Todo',
              completed: true,
            },
          },
        });
    });

    it('should require an id', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe('Field "DeleteOneInput.id" of required type "ID!" was not provided.');
        });
    });
  });

  describe('delete many', () => {
    it('should require a header secret', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Forbidden resource');
        });
    });
    it('should allow updating a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
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
        }`,
        })
        .expect(200, {
          data: {
            deleteManyTodoItems: {
              deletedCount: 2,
            },
          },
        });
    });

    it('should require a filter', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe(
            'Field "DeleteManyTodoItemsInput.filter" of required type "TodoItemDeleteFilter!" was not provided.',
          );
        });
    });

    it('should require a non-empty filter', () => {
      return request(app.getHttpServer())
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object');
        });
    });
  });

  describe('addTagsToTodoItem', () => {
    it('allow adding subTasks to a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addTagsToTodoItem(
              input: {
                id: "${todoItemId}",
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.addTagsToTodoItem.tags;
          expect(body.data.addTagsToTodoItem.id).toBe('1');
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home', 'Work', 'Question', 'Blocked']);
        });
    });
  });

  describe('removeTagsFromTodoItem', () => {
    it('allow adding subTasks to a todoItem', () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .set(AUTH_HEADER_NAME, config.auth.header)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            removeTagsFromTodoItem(
              input: {
                id: "${todoItemId}",
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.removeTagsFromTodoItem.tags;
          expect(body.data.removeTagsFromTodoItem.id).toBe('1');
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);
          expect(edges.map((e) => e.node.name)).toEqual(['Urgent', 'Home']);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
