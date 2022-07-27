import { AggregateResponse, getQueryServiceToken, QueryService } from '@codeshine/nestjs-query-core';
import { CursorConnectionType } from '@codeshine/nestjs-query-query-graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
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
import { AuthService } from '../src/auth/auth.service';

describe('TodoItemResolver (auth - e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let user3JwtToken: string;

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

  beforeEach(async () => {
    const authService = app.get(AuthService);
    jwtToken = (await authService.login({ username: 'nestjs-query', id: 1 })).accessToken;
    user3JwtToken = (await authService.login({ username: 'nestjs-query-3', id: 3 })).accessToken;
  });

  afterAll(() => refresh(app.get(Connection)));

  describe('find one', () => {
    it('should require authorization token', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            ${todoItemFields}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => expect(body.errors[0].message).toBe('Unauthorized')));
    it(`should find a todo item by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            ${todoItemFields}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              todoItem: {
                id: '1',
                title: 'Create Nest App',
                completed: true,
                description: null,
                age: expect.any(Number),
              },
            },
          });
        }));

    it(`should find a users todo item by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
            todoItem(id: 1) {
              ${todoItemFields}
            }
          }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              todoItem: {
                id: '1',
                title: 'Create Nest App',
                completed: true,
                description: null,
                age: expect.any(Number),
              },
            },
          });
        }));

    it(`should return null if the todo item is not found`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 100) {
            ${todoItemFields}
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItem: null,
          },
        }));

    it(`should return subTasks as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
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
          edges.forEach((e) => expect(e.node.todoItemId).toBe('1'));
        }));

    it(`should return subTasksAggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            subTasksAggregate {
              ${subTaskAggregateFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO>[] = body.data.todoItem.subTasksAggregate;
          expect(agg).toEqual([
            {
              avg: { id: 2 },
              count: { completed: 3, description: 0, id: 3, title: 3, todoItemId: 3 },
              max: { description: null, id: '3', title: 'Create Nest App - Sub Task 3', todoItemId: '1' },
              min: { description: null, id: '1', title: 'Create Nest App - Sub Task 1', todoItemId: '1' },
              sum: { id: 6 },
            },
          ]);
        }));

    it(`should return tags as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
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
        }));

    it(`should return tagsAggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            tagsAggregate {
              ${tagAggregateFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TagDTO>[] = body.data.todoItem.tagsAggregate;
          expect(agg).toEqual([
            {
              avg: { id: 1.5 },
              count: { created: 2, id: 2, name: 2, updated: 2 },
              max: { id: '2', name: 'Urgent' },
              min: { id: '1', name: 'Home' },
              sum: { id: 3 },
            },
          ]);
        }));
  });

  describe('query', () => {
    it(`should require authorization`, () =>
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
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '3', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
            { id: '4', title: 'Add Todo Item Resolver', completed: false, description: null, age: expect.any(Number) },
            {
              id: '5',
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number),
            },
          ]);
        }));

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: [1, 2, 3] } }) {
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
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '3', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
          ]);
        }));

    it(`should allow querying for all users`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: [1, 2, 3] } }) {
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
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '3', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
          ]);
        }));

    it(`should allow querying on subTasks`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { subTasks: { title: { in: ["Create Nest App - Sub Task 1", "Create Entity - Sub Task 1"] } } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, totalCount, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
          ]);
        }));

    it(`should allow querying on tags`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { tags: { name: { eq: "Home" } } }, sorting: [{field: id, direction: ASC}]) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, totalCount, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
            { id: '4', title: 'Add Todo Item Resolver', completed: false, description: null, age: expect.any(Number) },
          ]);
        }));

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual([
            {
              id: '5',
              title: 'How to create item With Sub Tasks',
              completed: false,
              description: null,
              age: expect.any(Number),
            },
            { id: '4', title: 'Add Todo Item Resolver', completed: false, description: null, age: expect.any(Number) },
            { id: '3', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
            { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
          ]);
        }));

    it(`should throw an error if AuthorizationContext was not setup`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `{
              failingTodoItems {
              ${pageInfoField}
              ${edgeNodes(todoItemFields)}
              totalCount
            }
          }`,
        })
        .expect(200)
        .then(({ body }) =>
          expect(body.errors[0].message).toBe(
            'No AuthorizationContext available for method failingTodoItems! Make sure that you provide an AuthorizationContext to your custom methods as argument of the @AuthorizerFilter decorator.',
          ),
        ));

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .auth(jwtToken, { type: 'bearer' })
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
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual([
              { id: '1', title: 'Create Nest App', completed: true, description: null, age: expect.any(Number) },
              { id: '2', title: 'Create Entity', completed: false, description: null, age: expect.any(Number) },
            ]);
          }));

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .auth(jwtToken, { type: 'bearer' })
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {first: 2, after: "YXJyYXljb25uZWN0aW9uOjE="}) {
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
              endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual([
              { id: '3', title: 'Create Entity Service', completed: false, description: null, age: expect.any(Number) },
              {
                id: '4',
                title: 'Add Todo Item Resolver',
                completed: false,
                description: null,
                age: expect.any(Number),
              },
            ]);
          }));
    });
  });

  describe('aggregate', () => {
    it('should require authorization', () =>
      request(app.getHttpServer())
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
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));

    it(`should return a aggregate response`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate;
          expect(res).toEqual([
            {
              avg: { id: 3 },
              count: { completed: 5, created: 5, description: 0, id: 5, title: 5, updated: 5 },
              max: { description: null, id: '5', title: 'How to create item With Sub Tasks' },
              min: { description: null, id: '1', title: 'Add Todo Item Resolver' },
              sum: { id: 15 },
            },
          ]);
        }));

    it(`should return a aggregate response for all users`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
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
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate;
          expect(res).toEqual([
            {
              avg: { id: 8 },
              count: { completed: 15, created: 15, description: 0, id: 15, title: 15, updated: 15 },
              max: { description: null, id: '15', title: 'How to create item With Sub Tasks' },
              min: { description: null, id: '1', title: 'Add Todo Item Resolver' },
              sum: { id: 120 },
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
          todoItemAggregate(filter: { completed: { is: false } }) {
              ${todoItemAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.todoItemAggregate;
          expect(res).toEqual([
            {
              count: { id: 4, title: 4, description: 0, completed: 4, created: 4, updated: 4 },
              sum: { id: 14 },
              avg: { id: 3.5 },
              min: { id: '2', title: 'Add Todo Item Resolver', description: null },
              max: { id: '5', title: 'How to create item With Sub Tasks', description: null },
            },
          ]);
        }));
  });

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
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));
    it('should allow creating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
              id: '16',
              title: 'Test Todo',
              completed: false,
            },
          },
        }));

    it('should forbid creating a todoItem for user 3', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
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
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));

    it('should call the beforeCreateOne hook', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
              id: '17',
              title: 'Create One Hook Todo',
              completed: false,
              createdBy: 'nestjs-query',
            },
          },
        }));

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

  describe('create many', () => {
    it('should require auth token', () =>
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
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));

    it('should allow creating multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
              { id: '18', title: 'Many Test Todo 1', completed: false },
              { id: '19', title: 'Many Test Todo 2', completed: true },
            ],
          },
        }));

    it('should call the beforeCreateMany hook when creating multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
              { id: '20', title: 'Many Create Hook 1', completed: false, createdBy: 'nestjs-query' },
              { id: '21', title: 'Many Create Hook 2', completed: true, createdBy: 'nestjs-query' },
            ],
          },
        }));

    it('should validate a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "16",
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
              id: '16',
              title: 'Update Test Todo',
              completed: true,
            },
          },
        }));

    it('should not allow updating a todoItem that does not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "6",
                update: { title: "Should Not Update", completed: true }
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
          expect(body.errors[0].message).toBe('Unable to find TodoItemEntity with id: 6');
        }));

    it('should not allow updating a todoItem that does not belong to user 3', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
              updateOneTodoItem(
                input: {
                  id: "6",
                  update: { title: "Should Not Update", completed: true }
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
          expect(body.errors[0].message).toBe('Unable to find TodoItemEntity with id: 6');
        }));

    it('should call the beforeUpdateOne hook', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTodoItem(
              input: {
                id: "17",
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
              id: '17',
              title: 'Update One Hook Todo',
              completed: true,
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
        }));

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

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
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));
    it('should allow updating a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["17", "18"]} },
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
        }));

    it('should not allow update records that do not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["6", "7"]} },
                update: { title: "Should not update", completed: true }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 0,
            },
          },
        }));

    it('should not allow update records that do not belong to user 3', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
              updateManyTodoItems(
                input: {
                  filter: {id: { in: ["6", "7"]} },
                  update: { title: "Should not update", completed: true }
                }
              ) {
                updatedCount
              }
          }`,
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 0,
            },
          },
        }));

    it('should call the beforeUpdateMany hook when updating todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTodoItems(
              input: {
                filter: {id: { in: ["20", "21"]} },
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
          const todoItems = await queryService.query({ filter: { id: { in: [20, 21] } } });
          expect(
            todoItems.map((ti) => ({
              id: ti.id,
              title: ti.title,
              completed: ti.completed,
              updatedBy: ti.updatedBy,
            })),
          ).toEqual([
            { id: 20, title: 'Update Many Hook', completed: true, updatedBy: 'nestjs-query' },
            { id: 21, title: 'Update Many Hook', completed: true, updatedBy: 'nestjs-query' },
          ]);
        }));

    it('should require a filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

  describe('delete one', () => {
    it('should require a header secret', () =>
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
              completed
            }
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));
    it('should allow deleting a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTodoItem(
              input: { id: "16" }
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
        }));

    it('should not allow deleting a todoItem that does not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find TodoItemEntity with id: 6');
        }));

    it('should not allow deleting a todoItem that does not belong to user 3', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
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
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find TodoItemEntity with id: 6');
        }));

    it('should require an id', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
          expect(body.errors[0].message).toBe(
            'Field "DeleteOneTodoItemInput.id" of required type "ID!" was not provided.',
          );
        }));
  });

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
                filter: {id: { in: ["17", "18"]} },
              }
            ) {
              deletedCount
            }
        }`,
        })
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('Unauthorized');
        }));
    it('should allow deleting multiple todoItems', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: {id: { in: ["17", "18"]} },
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
        }));

    it('should not allow deleting multiple todoItems that do not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTodoItems(
              input: {
                filter: {id: { in: ["6", "7"]} },
              }
            ) {
              deletedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            deleteManyTodoItems: {
              deletedCount: 0,
            },
          },
        }));

    it('should not allow deleting multiple todoItems that do not belong to user 3', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(user3JwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
              deleteManyTodoItems(
                input: {
                  filter: {id: { in: ["6", "7"]} },
                }
              ) {
                deletedCount
              }
          }`,
        })
        .expect(200, {
          data: {
            deleteManyTodoItems: {
              deletedCount: 0,
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
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

  describe('addSubTasksToTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
                totalCount
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<SubTaskDTO> =
            body.data.addSubTasksToTodoItem.subTasks;
          expect(body.data.addSubTasksToTodoItem.id).toBe('1');
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjU=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(6);
          expect(edges).toHaveLength(6);
          edges.forEach((e) => expect(e.node.todoItemId).toBe('1'));
        }));

    it('should not allow adding subTasks to a todoItem that does not belong to the user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addSubTasksToTodoItem(
              input: {
                id: 6,
                relationIds: ["4", "5", "6"]
              }
            ) {
              id
              title
              subTasks {
                ${pageInfoField}
                ${edgeNodes(subTaskFields)}
                totalCount
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find TodoItemEntity with id: 6');
        }));

    it('should not allow adding subTasks that do not belong to a user to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addSubTasksToTodoItem(
              input: {
                id: 1,
                relationIds: ["16", "17", "18"]
              }
            ) {
              id
              title
              subTasks {
                ${pageInfoField}
                ${edgeNodes(subTaskFields)}
                totalCount
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toContain('Unable to find all subTasks to add to TodoItemEntity');
        }));
  });

  describe('addTagsToTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

  describe('removeTagsFromTodoItem', () => {
    it('allow adding subTasks to a todoItem', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .auth(jwtToken, { type: 'bearer' })
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
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
