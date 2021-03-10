import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { OffsetConnectionType } from '@nestjs-query/query-graphql';
import { AppModule } from '../src/app.module';
import { SubTaskDTO } from '../src/sub-task/dto/sub-task.dto';
import { TagDTO } from '../src/tag/dto/tag.dto';
import { refresh } from './fixtures';
import { offsetConnection, subTaskFields, tagFields, todoItemFields } from './graphql-fragments';

describe('TodoItemResolver (limitOffset - e2e)', () => {
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
    await refresh(app.get(Connection));
  });

  const todoItems = [
    { id: '1', title: 'Create Nest App', completed: true, description: null },
    { id: '2', title: 'Create Entity', completed: false, description: null },
    { id: '3', title: 'Create Entity Service', completed: false, description: null },
    { id: '4', title: 'Add Todo Item Resolver', completed: false, description: null },
    { id: '5', title: 'How to create item With Sub Tasks', completed: false, description: null },
  ];

  afterAll(() => refresh(app.get(Connection)));

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
        }`,
        })
        .expect(200, { data: { todoItem: todoItems[0] } }));

    it(`should return null if the todo item is not found`, () =>
      request(app.getHttpServer())
        .post('/graphql')
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
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            subTasks(sorting: { field: id, direction: ASC }) {
              ${offsetConnection(subTaskFields)}
            }
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItem: {
              subTasks: {
                nodes: [
                  {
                    completed: true,
                    description: null,
                    id: '1',
                    title: 'Create Nest App - Sub Task 1',
                    todoItemId: '1',
                  },
                  {
                    completed: false,
                    description: null,
                    id: '2',
                    title: 'Create Nest App - Sub Task 2',
                    todoItemId: '1',
                  },
                  {
                    completed: false,
                    description: null,
                    id: '3',
                    title: 'Create Nest App - Sub Task 3',
                    todoItemId: '1',
                  },
                ],
                pageInfo: {
                  hasNextPage: false,
                  hasPreviousPage: false,
                },
              },
            },
          },
        }));

    it(`should return tags as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItem(id: 1) {
            tags(sorting: [{ field: id, direction: ASC }]) {
              ${offsetConnection(tagFields)}
            }
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItem: {
              tags: {
                nodes: [
                  { id: '1', name: 'Urgent' },
                  { id: '2', name: 'Home' },
                ],
                pageInfo: { hasNextPage: false, hasPreviousPage: false },
              },
            },
          },
        }));
  });

  describe('query', () => {
    it(`should return a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems {
            ${offsetConnection(todoItemFields)}
          }
        }`,
        })
        .expect(200, {
          data: { todoItems: { nodes: todoItems, pageInfo: { hasNextPage: false, hasPreviousPage: false } } },
        }));

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(filter: { id: { in: [1, 2, 3] } }) {
            ${offsetConnection(todoItemFields)}
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItems: { nodes: todoItems.slice(0, 3), pageInfo: { hasNextPage: false, hasPreviousPage: false } },
          },
        }));

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems(sorting: [{field: id, direction: DESC}]) {
            ${offsetConnection(todoItemFields)}
          }
        }`,
        })
        .expect(200, {
          data: {
            todoItems: { nodes: todoItems.slice().reverse(), pageInfo: { hasNextPage: false, hasPreviousPage: false } },
          },
        }));

    describe('paging', () => {
      it(`should allow paging with the 'limit' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {limit: 2}) {
            ${offsetConnection(todoItemFields)}
          }
        }`,
          })
          .expect(200, {
            data: {
              todoItems: { nodes: todoItems.slice(0, 2), pageInfo: { hasNextPage: true, hasPreviousPage: false } },
            },
          }));

      it(`should allow paging with the 'limit' field and 'offset'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          todoItems(paging: {limit: 2, offset: 2}) {
            ${offsetConnection(todoItemFields)}
          }
        }`,
          })
          .expect(200, {
            data: {
              todoItems: { nodes: todoItems.slice(2, 4), pageInfo: { hasNextPage: true, hasPreviousPage: true } },
            },
          }));
    });
  });

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
        }));

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
              completed
            }
        }`,
        })
        .expect(200, {
          data: {
            createManyTodoItems: [
              { id: '7', title: 'Many Test Todo 1', completed: false },
              { id: '8', title: 'Many Test Todo 2', completed: true },
            ],
          },
        }));

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
        }));

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
        }`,
        })
        .expect(200, {
          data: {
            updateManyTodoItems: {
              updatedCount: 2,
            },
          },
        }));

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
              completed
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
        }`,
        })
        .expect(200, {
          data: {
            deleteManyTodoItems: {
              deletedCount: 2,
            },
          },
        }));

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
                ${offsetConnection(subTaskFields)}
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const {
            id,
            subTasks,
          }: { id: string; subTasks: OffsetConnectionType<SubTaskDTO> } = body.data.addSubTasksToTodoItem;
          expect(id).toBe('1');
          expect(subTasks.nodes).toHaveLength(6);
          subTasks.nodes.forEach((e) => expect(e.todoItemId).toBe('1'));
        }));
  });

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
                ${offsetConnection(tagFields)}
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { id, tags }: { id: string; tags: OffsetConnectionType<TagDTO> } = body.data.addTagsToTodoItem;
          expect(id).toBe('1');
          expect(tags.nodes).toHaveLength(5);
          expect(tags.nodes.map((e) => e.name)).toEqual(['Urgent', 'Home', 'Work', 'Question', 'Blocked']);
        }));
  });

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
                ${offsetConnection(tagFields)}
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { id, tags }: { id: string; tags: OffsetConnectionType<TagDTO> } = body.data.removeTagsFromTodoItem;
          expect(id).toBe('1');
          expect(tags.nodes).toHaveLength(2);
          expect(tags.nodes.map((e) => e.name)).toEqual(['Urgent', 'Home']);
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
