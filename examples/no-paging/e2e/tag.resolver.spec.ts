import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto';
import { refresh } from './fixtures';
import { tagFields, todoItemFields } from './graphql-fragments';

describe('TagResolver (noPaging - e2e)', () => {
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

  afterAll(() => refresh(app.get(Connection)));

  const tags = [
    { id: '1', name: 'Urgent' },
    { id: '2', name: 'Home' },
    { id: '3', name: 'Work' },
    { id: '4', name: 'Question' },
    { id: '5', name: 'Blocked' },
  ];

  describe('find one', () => {
    it(`should find a tag by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: 1) {
            ${tagFields}
          }
        }`,
        })
        .expect(200, { data: { tag: tags[0] } }));

    it(`should return null if the tag is not found`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: 100) {
            ${tagFields}
          }
        }`,
        })
        .expect(200, {
          data: {
            tag: null,
          },
        }));

    it(`should return todoItems as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: 1) {
            todoItems(sorting: [{ field: id, direction: ASC }]) {
              id
            }
          }
        }`,
        })
        .expect(200)
        .expect({ data: { tag: { todoItems: [{ id: '1' }, { id: '2' }] } } }));
  });

  describe('query', () => {
    it(`should return a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags {
            ${tagFields}
          }
        }`,
        })
        .expect(200)
        .expect({ data: { tags } }));

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(filter: { id: { in: [1, 2, 3] } }) {
            ${tagFields}
          }
        }`,
        })
        .expect(200)
        .expect({ data: { tags: tags.slice(0, 3) } }));

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(sorting: [{field: id, direction: DESC}]) {
            ${tagFields}
          }
        }`,
        })
        .expect(200)
        .expect({ data: { tags: tags.slice().reverse() } }));

    describe('paging', () => {
      it(`should not allow paging with the 'limit' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          tags(paging: {limit: 2}) {
            ${tagFields}
          }
        }`,
          })
          .expect(400)
          .expect(({ body }) => expect(JSON.stringify(body)).toContain('Unknown argument \\"paging\\"')));
    });
  });

  describe('create one', () => {
    it('should allow creating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTag(
              input: {
                tag: { name: "Test Tag" }
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200, {
          data: {
            createOneTag: {
              id: '6',
              name: 'Test Tag',
            },
          },
        }));

    it('should validate a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTag(
              input: {
                tag: { name: "" }
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty');
        }));
  });

  describe('create many', () => {
    it('should allow creating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTags(
              input: {
                tags: [
                  { name: "Create Many Tag - 1" },
                  { name: "Create Many Tag - 2" }
                ]
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200, {
          data: {
            createManyTags: [
              { id: '7', name: 'Create Many Tag - 1' },
              { id: '8', name: 'Create Many Tag - 2' },
            ],
          },
        }));

    it('should validate a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTags(
              input: {
                tags: [{ name: "" }]
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty');
        }));
  });

  describe('update one', () => {
    it('should allow updating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTag(
              input: {
                id: "6",
                update: { name: "Update Test Tag" }
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200, {
          data: {
            updateOneTag: {
              id: '6',
              name: 'Update Test Tag',
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
            updateOneTag(
              input: {
                update: { name: "Update Test Tag" }
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe('Field "UpdateOneTagInput.id" of required type "ID!" was not provided.');
        }));

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTag(
              input: {
                id: "6",
                update: { name: "" }
              }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty');
        }));
  });

  describe('update many', () => {
    it('should allow updating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTags(
              input: {
                filter: {id: { in: ["7", "8"]} },
                update: { name: "Update Many Tag" }
              }
            ) {
              updatedCount
            }
        }`,
        })
        .expect(200, {
          data: {
            updateManyTags: {
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
            updateManyTags(
              input: {
                update: { name: "Update Many Tag" }
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
            'Field "UpdateManyTagsInput.filter" of required type "TagUpdateFilter!" was not provided.',
          );
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTags(
              input: {
                filter: { },
                update: { name: "Update Many Tag" }
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
    it('should allow deleting a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTag(
              input: { id: "6" }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(200, {
          data: {
            deleteOneTag: {
              id: null,
              name: 'Update Test Tag',
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
            deleteOneTag(
              input: { }
            ) {
              ${tagFields}
            }
        }`,
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1);
          expect(body.errors[0].message).toBe('Field "DeleteOneTagInput.id" of required type "ID!" was not provided.');
        }));
  });

  describe('delete many', () => {
    it('should allow updating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTags(
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
            deleteManyTags: {
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
            deleteManyTags(
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
            'Field "DeleteManyTagsInput.filter" of required type "TagDeleteFilter!" was not provided.',
          );
        }));

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyTags(
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

  describe('addTodoItemsToTag', () => {
    it('allow adding subTasks to a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            addTodoItemsToTag(
              input: {
                id: 1,
                relationIds: ["3", "4", "5"]
              }
            ) {
              ${tagFields}
              todoItems {
                ${todoItemFields}
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { id, todoItems }: { id: string; todoItems: TodoItemDTO[] } = body.data.addTodoItemsToTag;
          expect(id).toBe('1');
          expect(todoItems).toHaveLength(5);
          expect(todoItems.map((ti) => ti.title).sort()).toEqual([
            'Add Todo Item Resolver',
            'Create Entity',
            'Create Entity Service',
            'Create Nest App',
            'How to create item With Sub Tasks',
          ]);
        }));
  });

  describe('removeTodoItemsFromTag', () => {
    it('allow removing todoItems from a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            removeTodoItemsFromTag(
              input: {
                id: 1,
                relationIds: ["3", "4", "5"]
              }
            ) {
              ${tagFields}
              todoItems {
                ${todoItemFields}
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { id, todoItems }: { id: string; todoItems: TodoItemDTO[] } = body.data.removeTodoItemsFromTag;
          expect(id).toBe('1');
          expect(todoItems).toHaveLength(2);
          expect(todoItems.map((e) => e.title).sort()).toEqual(['Create Entity', 'Create Nest App']);
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
