import { INestApplication, ValidationPipe } from '@nestjs/common'
import { getConnectionToken } from '@nestjs/mongoose'
import { Test } from '@nestjs/testing'
import { AggregateResponse, getQueryServiceToken, QueryService } from '@ptc-org/nestjs-query-core'
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql'
import { Types } from 'mongoose'
import request from 'supertest'

import { AppModule } from '../src/app.module'
import { USER_HEADER_NAME } from '../src/constants'
import { TagDTO } from '../src/tag/dto/tag.dto'
import { TagEntity } from '../src/tag/tag.entity'
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto'
import { refresh, TAGS, TODO_ITEMS } from './fixtures'
import { edgeNodes, pageInfoField, tagAggregateFields, tagFields, todoItemAggregateFields } from './graphql-fragments'

describe('TagResolver (mongoose - e2e)', () => {
  let app: INestApplication

  const USER_NAME = 'E2E Test'

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

  describe('find one', () => {
    it(`should find a tag by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: "${TAGS[0].id}") {
            ${tagFields}
          }
        }`
        })
        .expect(200, { data: { tag: TAGS[0] } }))

    it(`should throw item not found on non existing tag`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: "${new Types.ObjectId().toString()}") {
            ${tagFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toContain('Unable to find')
        }))

    it(`should return todoItems as a connection`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: "${TAGS[0].id}") {
            todoItems(sorting: [{ field: id, direction: ASC }]) {
              ${pageInfoField}
              ${edgeNodes('id')}
              totalCount
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TodoItemDTO> = body.data.tag.todoItems
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(totalCount).toBe(2)
          expect(edges).toHaveLength(2)
          expect(edges.map((e) => e.node.id)).toEqual(TODO_ITEMS.slice(0, 2).map((td) => td.id))
        }))

    it(`should return todoItems aggregate`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: "${TAGS[0].id}") {
            todoItemsAggregate {
              ${todoItemAggregateFields}
            }
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const agg: AggregateResponse<TodoItemDTO>[] = body.data.tag.todoItemsAggregate
          expect(agg).toEqual([
            {
              count: { completed: 2, createdAt: 2, description: 0, id: 2, title: 2, updatedAt: 2 },
              max: { description: null, id: TODO_ITEMS[1].id, title: 'Create Nest App' },
              min: { description: null, id: TODO_ITEMS[0].id, title: 'Create Entity' }
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
          tags {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWYifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWIifV19'
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node)).toEqual(TAGS)
        }))

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(filter: { id: { in: [${TAGS.slice(0, 3)
            .map((t) => `"${t.id}"`)
            .join(',')}] } }) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWQifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWIifV19'
          })
          expect(totalCount).toBe(3)
          expect(edges).toHaveLength(3)
          expect(edges.map((e) => e.node)).toEqual(TAGS.slice(0, 3))
        }))

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags
          expect(pageInfo).toEqual({
            endCursor: 'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWIifV19',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor:
              'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWYifV19'
          })
          expect(totalCount).toBe(5)
          expect(edges).toHaveLength(5)
          expect(edges.map((e) => e.node)).toEqual(TAGS.slice().reverse())
        }))

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
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWMifV19',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWIifV19'
            })
            expect(totalCount).toBe(5)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual(TAGS.slice(0, 2))
          }))

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          tags(paging: {first: 2, after: "eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWMifV19"}) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
            totalCount
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo, totalCount }: CursorConnectionType<TagDTO> = body.data.tags
            expect(pageInfo).toEqual({
              endCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWUifV19',
              hasNextPage: true,
              hasPreviousPage: true,
              startCursor:
                'eyJ0eXBlIjoia2V5c2V0IiwiZmllbGRzIjpbeyJmaWVsZCI6ImlkIiwidmFsdWUiOiI1Zjc0ZWQyNjg2YjJiYWU3YmY0YjRhYWQifV19'
            })
            expect(totalCount).toBe(5)
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual(TAGS.slice(2, 4))
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
          tagAggregate {
              ${tagAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.tagAggregate
          expect(res).toEqual([
            {
              count: { id: 5, name: 5, createdAt: 5, updatedAt: 5 },
              min: { id: TAGS[0].id, name: 'Blocked' },
              max: { id: TAGS[4].id, name: 'Work' }
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
          tagAggregate(filter: { name: { in: ["Urgent", "Blocked", "Work"] } }) {
              ${tagAggregateFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const res: AggregateResponse<TodoItemDTO>[] = body.data.tagAggregate
          expect(res).toEqual([
            {
              count: { id: 3, name: 3, createdAt: 3, updatedAt: 3 },
              min: { id: '5f74ed2686b2bae7bf4b4aab', name: 'Blocked' },
              max: { id: '5f74ed2686b2bae7bf4b4aaf', name: 'Work' }
            }
          ])
        }))
  })

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createOneTag: {
                id: expect.any(String),
                name: 'Test Tag'
              }
            }
          })
        }))

    it('should call beforeCreateOne hook when creating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, USER_NAME)
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
        }`
        })
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createOneTag: {
                id: expect.any(String),
                name: 'Before Create One Tag',
                createdBy: USER_NAME
              }
            }
          })
        }))

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty')
        }))
  })

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createManyTags: [
                { id: expect.any(String), name: 'Create Many Tag - 1' },
                { id: expect.any(String), name: 'Create Many Tag - 2' }
              ]
            }
          })
        }))

    it('should call beforeCreateMany hook when creating multiple TAGS', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, USER_NAME)
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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              createManyTags: [
                { id: expect.any(String), name: 'Before Create Many Tag - 1', createdBy: USER_NAME },
                { id: expect.any(String), name: 'Before Create Many Tag - 2', createdBy: USER_NAME }
              ]
            }
          })
        }))

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty')
        }))
  })

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
                id: "${TAGS[0].id}",
                update: { name: "Update Test Tag" }
              }
            ) {
              ${tagFields}
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneTag: {
              id: TAGS[0].id,
              name: 'Update Test Tag'
            }
          }
        }))

    it('should call beforeUpdateOne hook when updating a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, USER_NAME)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTag(
              input: {
                id: "${TAGS[0].id}",
                update: { name: "Before Update One Test Tag" }
              }
            ) {
              ${tagFields}
              updatedBy
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneTag: {
              id: TAGS[0].id,
              name: 'Before Update One Test Tag',
              updatedBy: USER_NAME
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
            updateOneTag(
              input: {
                update: { name: "Update Test Tag" }
              }
            ) {
              ${tagFields}
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "UpdateOneTagInput.id" of required type "ID!" was not provided.')
        }))

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneTag(
              input: {
                id: "${TAGS[0].id}",
                update: { name: "" }
              }
            ) {
              ${tagFields}
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('name should not be empty')
        }))
  })

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
                filter: { id: { in: ["${TAGS[0].id}", "${TAGS[1].id}"]} },
                update: { name: "Update Many Tag" }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200, {
          data: {
            updateManyTags: {
              updatedCount: 2
            }
          }
        }))

    it('should call beforeUpdateMany hook when updating multiple TAGS', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .set(USER_HEADER_NAME, USER_NAME)
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyTags(
              input: {
                filter: { id: { in: ["${TAGS[0].id}", "${TAGS[1].id}"]} },
                update: { name: "Before Update Many Tag" }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200, {
          data: {
            updateManyTags: {
              updatedCount: 2
            }
          }
        })
        .then(async () => {
          const queryService = app.get<QueryService<TagEntity>>(getQueryServiceToken(TagEntity))
          const todoItems = await queryService.query({ filter: { id: { in: [TAGS[0].id, TAGS[1].id] } } })
          expect(
            todoItems.map((ti) => ({
              id: ti.id,
              name: ti.name,
              updatedBy: ti.updatedBy
            }))
          ).toEqual([
            { id: TAGS[0].id, name: 'Before Update Many Tag', updatedBy: USER_NAME },
            { id: TAGS[1].id, name: 'Before Update Many Tag', updatedBy: USER_NAME }
          ])
        }))

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
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe(
            'Field "UpdateManyTagsInput.filter" of required type "TagUpdateFilter!" was not provided.'
          )
        }))

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object')
        }))
  })

  describe('delete one', () => {
    it('should allow deleting a tag', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneTag(
              input: { id: "${TAGS[0].id}" }
            ) {
              ${tagFields}
            }
        }`
        })
        .expect(200, {
          data: {
            deleteOneTag: {
              id: TAGS[0].id,
              name: TAGS[0].name
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
            deleteOneTag(
              input: { }
            ) {
              ${tagFields}
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "DeleteOneTagInput.id" of required type "ID!" was not provided.')
        }))
  })

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
                filter: {id: { in: ["${TAGS[0].id}", "${TAGS[1].id}"]} },
              }
            ) {
              deletedCount
            }
        }`
        })
        .expect(200, {
          data: {
            deleteManyTags: {
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
            deleteManyTags(
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
            'Field "DeleteManyTagsInput.filter" of required type "TagDeleteFilter!" was not provided.'
          )
        }))

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
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('filter must be a non-empty object')
        }))
  })

  afterAll(async () => {
    await app.close()
  })
})
