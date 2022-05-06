import { AggregateResponse, getQueryServiceToken, QueryService } from '@ptc-org/nestjs-query-core';
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TagDTO } from '../src/tag/dto/tag.dto';
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto';
import { refresh } from './fixtures';
import {
  edgeNodes,
  pageInfoField,
  tagFields,
  todoItemFields,
  tagAggregateFields,
  todoItemAggregateFields,
} from './graphql-fragments';
import { USER_HEADER_NAME } from '../src/constants';
import { TagEntity } from '../src/tag/tag.entity';

describe('TagResolver (typeorm - e2e)', () => {
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
              ${pageInfoField}
              ${edgeNodes('id')}
              totalCount
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.tag.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);
          expect(edges.map((e) => e.node.id)).toEqual(['1', '2']);
        }));

    it(`should return todoItems aggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: 1) {
            todoItemsAggregate {
              ${todoItemAggregateFields}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TodoItemDTO>[] = body.data.tag.todoItemsAggregate;
          expect(agg).toEqual([
            {
              avg: { id: 1.5 },
              count: { completed: 2, created: 2, description: 0, id: 2, title: 2, updated: 2 },
              max: { description: null, id: '2', title: 'Create Nest App' },
              min: { description: null, id: '1', title: 'Create Entity' },
              sum: { id: 3 },
            },
          ]);
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
          tags {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjV9XX0=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjF9XX0=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual(tags);
        }));

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(filter: { id: { in: [1, 2, 3] } }) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjN9XX0=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjF9XX0=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual(tags.slice(0, 3));
        }));

    it(`should allow querying on todoItems`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(filter: { todoItems: { title: { like: "Create Entity%" } } }, sorting: [{field: id, direction: ASC}]) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjV9XX0=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjF9XX0=',
          });
          expect(totalCount).toBe(3);
          expect(edges).toHaveLength(3);
          expect(edges.map((e) => e.node)).toEqual([tags[0], tags[2], tags[4]]);
        }));

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjF9XX0=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjV9XX0=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node)).toEqual(tags.slice().reverse());
        }));

    describe('paging', () => {
      it(`should allow paging with the 'first' field`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          tags(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
            expect(pageInfo).toEqual({
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjJ9XX0=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjF9XX0=',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual(tags.slice(0, 2));
          }));

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          tags(paging: {first: 2, after: "eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjJ9XX0="}) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags;
            expect(pageInfo).toEqual({
              endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjR9XX0=',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOjN9XX0=',
            });
            expect(totalCount).toBe(5);
            expect(edges).toHaveLength(2);
            expect(edges.map((e) => e.node)).toEqual(tags.slice(2, 4));
          }));
    });
  });

  describe('aggregate', () => {
    it(`should return a aggregate response`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          tagAggregate {
              ${tagAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.tagAggregate;
          expect(res).toEqual([
            {
              count: { id: 5, name: 5, created: 5, updated: 5 },
              sum: { id: 15 },
              avg: { id: 3 },
              min: { id: '1', name: 'Blocked' },
              max: { id: '5', name: 'Work' },
            },
          ]);
        }));

    it(`should allow filtering`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{ 
          tagAggregate(filter: { name: { in: ["Urgent", "Blocked", "Work"] } }) {
              ${tagAggregateFields}
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.tagAggregate;
          expect(res).toEqual([
            {
              count: { id: 3, name: 3, created: 3, updated: 3 },
              sum: { id: 9 },
              avg: { id: 3 },
              min: { id: '1', name: 'Blocked' },
              max: { id: '5', name: 'Work' },
            },
          ]);
        }));
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

    it('should call beforeCreateOne hook when creating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, 'E2E Test')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneTag(
              input: {
                tag: { name: "Before Create One Tag" }
              }
            ) {
              ${tagFields}
              createdBy
            }
        }`,
        })
        .expect(200, {
          data: {
            createOneTag: {
              id: '7',
              name: 'Before Create One Tag',
              createdBy: 'E2E Test',
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
              { id: '8', name: 'Create Many Tag - 1' },
              { id: '9', name: 'Create Many Tag - 2' },
            ],
          },
        }));

    it('should call beforeCreateMany hook when creating multiple tags', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, 'E2E Test')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyTags(
              input: {
                tags: [
                  { name: "Before Create Many Tag - 1" },
                  { name: "Before Create Many Tag - 2" }
                ]
              }
            ) {
              ${tagFields}
              createdBy
            }
        }`,
        })
        .expect(200, {
          data: {
            createManyTags: [
              { id: '10', name: 'Before Create Many Tag - 1', createdBy: 'E2E Test' },
              { id: '11', name: 'Before Create Many Tag - 2', createdBy: 'E2E Test' },
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

    it('should call beforeUpdateOne hook when updating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, 'E2E Test')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTag(
              input: {
                id: "7",
                update: { name: "Before Update One Test Tag" }
              }
            ) {
              ${tagFields}
              updatedBy
            }
        }`,
        })
        .expect(200, {
          data: {
            updateOneTag: {
              id: '7',
              name: 'Before Update One Test Tag',
              updatedBy: 'E2E Test',
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
                filter: {id: { in: ["8", "9"]} },
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

    it('should call beforeUpdateMany hook when updating multiple tags', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, 'E2E Test')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTags(
              input: {
                filter: {id: { in: ["10", "11"]} },
                update: { name: "Before Update Many Tag" }
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
        })
        .then(async () => {
          const queryService = app.get<QueryService<TagEntity>>(getQueryServiceToken(TagEntity));
          const todoItems = await queryService.query({ filter: { id: { in: [10, 11] } } });
          expect(
            todoItems.map((ti) => ({
              id: ti.id,
              name: ti.name,
              updatedBy: ti.updatedBy,
            })),
          ).toEqual([
            { id: 10, name: 'Before Update Many Tag', updatedBy: 'E2E Test' },
            { id: 11, name: 'Before Update Many Tag', updatedBy: 'E2E Test' },
          ]);
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
                ${pageInfoField}
                ${edgeNodes(todoItemFields)}
                totalCount
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> =
            body.data.addTodoItemsToTag.todoItems;
          expect(body.data.addTodoItemsToTag.id).toBe('1');
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(5);
          expect(edges).toHaveLength(5);
          expect(edges.map((e) => e.node.title).sort()).toEqual([
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
                ${pageInfoField}
                ${edgeNodes(todoItemFields)}
                totalCount
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> =
            body.data.removeTodoItemsFromTag.todoItems;
          expect(body.data.removeTodoItemsFromTag.id).toBe('1');
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(totalCount).toBe(2);
          expect(edges).toHaveLength(2);
          expect(edges.map((e) => e.node.title).sort()).toEqual(['Create Entity', 'Create Nest App']);
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
