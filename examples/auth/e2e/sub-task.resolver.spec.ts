import { AggregateResponse } from '@nestjs-query/core';
import { CursorConnectionType } from '@nestjs-query/query-graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto';
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto';
import { refresh } from './fixtures';
import { edgeNodes, pageInfoField, subTaskAggregateFields, subTaskFields, todoItemFields } from './graphql-fragments';
import { AuthService } from '../src/auth/auth.service';

describe('SubTaskResolver (auth - e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;

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
    await refresh(app.get(Connection));
  });

  afterAll(() => refresh(app.get(Connection)));

  beforeEach(async () => {
    const authService = app.get(AuthService);
    jwtToken = (await authService.login({ username: 'nestjs-query', id: 1 })).accessToken;
  });

  const subTasks = [
    { id: '1', title: 'Create Nest App - Sub Task 1', completed: true, description: null, todoItemId: '1' },
    { id: '2', title: 'Create Nest App - Sub Task 2', completed: false, description: null, todoItemId: '1' },
    { id: '3', title: 'Create Nest App - Sub Task 3', completed: false, description: null, todoItemId: '1' },
    { id: '4', title: 'Create Entity - Sub Task 1', completed: true, description: null, todoItemId: '2' },
    { id: '5', title: 'Create Entity - Sub Task 2', completed: false, description: null, todoItemId: '2' },
    { id: '6', title: 'Create Entity - Sub Task 3', completed: false, description: null, todoItemId: '2' },
    {
      id: '7',
      title: 'Create Entity Service - Sub Task 1',
      completed: true,
      description: null,
      todoItemId: '3',
    },
    {
      id: '8',
      title: 'Create Entity Service - Sub Task 2',
      completed: false,
      description: null,
      todoItemId: '3',
    },
    {
      id: '9',
      title: 'Create Entity Service - Sub Task 3',
      completed: false,
      description: null,
      todoItemId: '3',
    },
    {
      id: '10',
      title: 'Add Todo Item Resolver - Sub Task 1',
      completed: true,
      description: null,
      todoItemId: '4',
    },
    {
      completed: false,
      description: null,
      id: '11',
      title: 'Add Todo Item Resolver - Sub Task 2',
      todoItemId: '4',
    },
    {
      completed: false,
      description: null,
      id: '12',
      title: 'Add Todo Item Resolver - Sub Task 3',
      todoItemId: '4',
    },
    {
      completed: true,
      description: null,
      id: '13',
      title: 'How to create item With Sub Tasks - Sub Task 1',
      todoItemId: '5',
    },
    {
      completed: false,
      description: null,
      id: '14',
      title: 'How to create item With Sub Tasks - Sub Task 2',
      todoItemId: '5',
    },
    {
      completed: false,
      description: null,
      id: '15',
      title: 'How to create item With Sub Tasks - Sub Task 3',
      todoItemId: '5',
    },
  ];

  describe('find one', () => {
    it(`should require auth token`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: 1) {
            ${subTaskFields}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it(`should a sub task by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: 1) {
            ${subTaskFields}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              subTask: {
                id: '1',
                title: 'Create Nest App - Sub Task 1',
                completed: true,
                description: null,
                todoItemId: '1',
              },
            },
          });
        }));

    it(`should return null if the sub task is not found`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: 100) {
            ${subTaskFields}
          }
        }`,
        })
        .expect(200, {
          data: {
            subTask: null,
          },
        }));

    it(`should return a todo item relation`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTask(id: 1) {
            todoItem {
              ${todoItemFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              subTask: {
                todoItem: {
                  id: '1',
                  title: 'Create Nest App',
                  completed: true,
                  description: null,
                  age: expect.any(Number),
                },
              },
            },
          });
        }));
  });

  describe('query', () => {
    it(`should require an auth token`, () =>
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
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it(`should return a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjk=',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(15);
          expect(edges).toHaveLength(10);
          expect(edges.map((e) => e.node)).toEqual(subTasks.slice(0, 10));
        }));

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks(filter: { id: { in: [1, 2, 3] } }) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual(subTasks.slice(0, 3));
        }));

    it(`should allow querying on todoItem`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks(filter: { todoItem: { title: { like: "Create Entity%" } } }) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjU=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(6);
          expect(edges).toHaveLength(6);
          expect(edges.map((e) => e.node)).toEqual(subTasks.slice(3, 9));
        }));

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          subTasks(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjk=',
            hasNextPage: true,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(15);
          expect(edges).toHaveLength(10);
          expect(edges.map((e) => e.node)).toEqual(subTasks.slice().reverse().slice(0, 10));
        }));

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .auth(jwtToken, { type: 'bearer' })
          .send({
            operationName: null,
            variables: {},
            query: `{
          subTasks(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            });
            expect(totalCount).toBe(15);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual(subTasks.slice(0, 2));
          }));

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .auth(jwtToken, { type: 'bearer' })
          .send({
            operationName: null,
            variables: {},
            query: `{
          subTasks(paging: {first: 2, after: "YXJyYXljb25uZWN0aW9uOjE="}) {
            ${pageInfoField}
            ${edgeNodes(subTaskFields)}
            totalCount
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> = body.data.subTasks;
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            });
            expect(totalCount).toBe(15);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual(subTasks.slice(2, 4));
          }));
    });
  });

  describe('aggregate', () => {
    it(`should require an auth token`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          subTaskAggregate {
              ${subTaskAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));

    it(`should return a aggregate response`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          subTaskAggregate {
              ${subTaskAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.subTaskAggregate;
          expect(res).toEqual([
            {
              count: { id: 15, title: 15, description: 0, completed: 15, todoItemId: 15 },
              sum: { id: 120 },
              avg: { id: 8 },
              min: { id: '1', title: 'Add Todo Item Resolver - Sub Task 1', description: null, todoItemId: '1' },
              max: {
                id: '15',
                title: 'How to create item With Sub Tasks - Sub Task 3',
                description: null,
                todoItemId: '5',
              },
            },
          ]);
        }));

    it(`should allow filtering`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          subTaskAggregate(filter: {completed: {is: true}}) {
              ${subTaskAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.subTaskAggregate;
          expect(res).toEqual([
            {
              count: { id: 5, title: 5, description: 0, completed: 5, todoItemId: 5 },
              sum: { id: 35 },
              avg: { id: 7 },
              min: { id: '1', title: 'Add Todo Item Resolver - Sub Task 1', description: null, todoItemId: '1' },
              max: {
                id: '13',
                title: 'How to create item With Sub Tasks - Sub Task 1',
                description: null,
                todoItemId: '5',
              },
            },
          ]);
        }));
  });

  describe('create one', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneSubTask(
              input: {
                subTask: { title: "Test SubTask", completed: false, todoItemId: "1" }
              }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should allow creating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneSubTask(
              input: {
                subTask: { title: "Test SubTask", completed: false, todoItemId: "1" }
              }
            ) {
              ${subTaskFields}
              createdBy
            }
        }`,
        })
        .expect(200, {
          data: {
            createOneSubTask: {
              id: '46',
              title: 'Test SubTask',
              description: null,
              completed: false,
              todoItemId: '1',
              createdBy: 'nestjs-query',
            },
          },
        }));

    it('should validate a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneSubTask(
              input: {
                subTask: { title: "", completed: false, todoItemId: "1" }
              }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty');
        }));
  });

  describe('create many', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManySubTasks(
              input: {
                subTasks: [
                  { title: "Test Create Many SubTask - 1", completed: false, todoItemId: "2" },
                  { title: "Test Create Many SubTask - 2", completed: true, todoItemId: "2" },
                ]
              }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should allow creating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManySubTasks(
              input: {
                subTasks: [
                  { title: "Test Create Many SubTask - 1", completed: false, todoItemId: "2" },
                  { title: "Test Create Many SubTask - 2", completed: true, todoItemId: "2" },
                ]
              }
            ) {
              ${subTaskFields}
              createdBy
            }
        }`,
        })
        .expect(200, {
          data: {
            createManySubTasks: [
              {
                id: '47',
                title: 'Test Create Many SubTask - 1',
                description: null,
                completed: false,
                todoItemId: '2',
                createdBy: 'nestjs-query',
              },
              {
                id: '48',
                title: 'Test Create Many SubTask - 2',
                description: null,
                completed: true,
                todoItemId: '2',
                createdBy: 'nestjs-query',
              },
            ],
          },
        }));

    it('should validate a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManySubTasks(
              input: {
                subTasks: [{ title: "", completed: false, todoItemId: "2" }]
              }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty');
        }));
  });

  describe('update one', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneSubTask(
              input: {
                id: "46",
                update: { title: "Update Test Sub Task", completed: true }
              }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should allow updating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneSubTask(
              input: {
                id: "46",
                update: { title: "Update Test Sub Task", completed: true }
              }
            ) {
              ${subTaskFields}
              updatedBy
            }
        }`,
        })
        .expect(200, {
          data: {
            updateOneSubTask: {
              id: '46',
              title: 'Update Test Sub Task',
              description: null,
              completed: true,
              todoItemId: '1',
              updatedBy: 'nestjs-query',
            },
          },
        }));

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe(
            'Field "UpdateOneSubTaskInput.id" of required type "ID!" was not provided.',
          );
        }));

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneSubTask(
              input: {
                id: "46",
                update: { title: "" }
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
          expect(JSON.stringify(body.errors[0])).toContain('title should not be empty');
        }));
  });

  describe('update many', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManySubTasks(
              input: {
                filter: {id: { in: ["17", "18"]} },
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should allow updating a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManySubTasks(
              input: {
                filter: {id: { in: ["47", "48"]} },
                update: { title: "Update Many Test", completed: true }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            updateManySubTasks: {
              updatedCount: 2,
            },
          },
        }));

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe(
            'Field "UpdateManySubTasksInput.filter" of required type "SubTaskUpdateFilter!" was not provided.',
          );
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object');
        }));
  });

  describe('delete one', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneSubTask(
              input: { id: "16" }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));

    it('should allow deleting a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneSubTask(
              input: { id: "46" }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(200, {
          data: {
            deleteOneSubTask: {
              id: null,
              title: 'Update Test Sub Task',
              completed: true,
              description: null,
              todoItemId: '1',
            },
          },
        }));

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneSubTask(
              input: { }
            ) {
              ${subTaskFields}
            }
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe('Field "DeleteOneInput.id" of required type "ID!" was not provided.');
        }));
  });

  describe('delete many', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManySubTasks(
              input: {
                filter: {id: { in: ["47", "48"]} },
              }
            ) {
              deletedCount
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should allow deleting multiple subTasks', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManySubTasks(
              input: {
                filter: {id: { in: ["47", "48"]} },
              }
            ) {
              deletedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            deleteManySubTasks: {
              deletedCount: 2,
            },
          },
        }));

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManySubTasks(
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
            'Field "DeleteManySubTasksInput.filter" of required type "SubTaskDeleteFilter!" was not provided.',
          );
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object');
        }));
  });

  describe('setTodoItemOnSubTask', () => {
    it('should require an auth token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
          setTodoItemOnSubTask(input: { id: "1", relationId: "2" }) {
            id
            title
            todoItem {
              ${todoItemFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it('should set a the todoItem on a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
          setTodoItemOnSubTask(input: { id: "1", relationId: "2" }) {
            id
            title
            todoItem {
              ${todoItemFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              setTodoItemOnSubTask: {
                id: '1',
                title: 'Create Nest App - Sub Task 1',
                todoItem: {
                  id: '2',
                  title: 'Create Entity',
                  completed: false,
                  description: null,
                  age: expect.any(Number),
                },
              },
            },
          });
        }));
    it('should not allow setting a the todoItem that does not belong to the user on a subTask', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
          setTodoItemOnSubTask(input: { id: "1", relationId: "6" }) {
            id
            title
            todoItem {
              ${todoItemFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find todoItem to set on SubTaskEntity');
        }));
    it('should not allow setting a the todoItem on a subTask that does not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
          setTodoItemOnSubTask(input: { id: "16", relationId: "1" }) {
            id
            title
            todoItem {
              ${todoItemFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find SubTaskEntity with id: 16');
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
