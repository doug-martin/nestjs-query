import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql'
import request from 'supertest'
import { Connection } from 'typeorm'

import { AppModule } from '../src/app.module'
import { UserDTO } from '../src/user/dto/user.dto'
import { refresh } from './fixtures'
import { edgeNodes, pageInfoField, userFields } from './graphql-fragments'

describe('Federated - UserResolver (e2e)', () => {
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
    it(`should find a user by id`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          user(id: 1) {
            ${userFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual({
            data: {
              user: {
                id: '1',
                name: 'User 1',
                email: 'user1@example.com'
              }
            }
          })
        }))

    it(`should throw item not found on non existing user`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          user(id: 100) {
            ${userFields}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toContain('Unable to find')
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
          users {
            ${pageInfoField}
            ${edgeNodes(userFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<UserDTO> = body.data.users
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(3)
          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', name: 'User 1', email: 'user1@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' },
            { id: '3', name: 'User 3', email: 'user3@example.com' }
          ])
        }))

    it(`should allow querying`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          users(filter: { id: { in: [1, 2] } }) {
            ${pageInfoField}
            ${edgeNodes(userFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<UserDTO> = body.data.users
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(2)
          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', name: 'User 1', email: 'user1@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' }
          ])
        }))

    it(`should allow sorting`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          users(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(userFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<UserDTO> = body.data.users
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          })
          expect(edges).toHaveLength(3)
          expect(edges.map((e) => e.node)).toEqual([
            { id: '3', name: 'User 3', email: 'user3@example.com' },
            { id: '2', name: 'User 2', email: 'user2@example.com' },
            { id: '1', name: 'User 1', email: 'user1@example.com' }
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
              users(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(userFields)}
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo }: CursorConnectionType<UserDTO> = body.data.users
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
            })
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual([
              { id: '1', name: 'User 1', email: 'user1@example.com' },
              { id: '2', name: 'User 2', email: 'user2@example.com' }
            ])
          }))

      it(`should allow paging with the 'first' field and 'after'`, () =>
        request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          users(paging: {first: 2, after: "YXJyYXljb25uZWN0aW9uOjA="}) {
            ${pageInfoField}
            ${edgeNodes(userFields)}
          }
        }`
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo }: CursorConnectionType<UserDTO> = body.data.users
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
              hasNextPage: false,
              hasPreviousPage: true,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjE='
            })
            expect(edges).toHaveLength(2)
            expect(edges.map((e) => e.node)).toEqual([
              { id: '2', name: 'User 2', email: 'user2@example.com' },
              { id: '3', name: 'User 3', email: 'user3@example.com' }
            ])
          }))
    })
  })

  describe('create one', () => {
    it('should allow creating a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneUser(
              input: {
                user: { name: "User 4", email: "user4@example.com" }
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200, {
          data: {
            createOneUser: {
              id: '4',
              name: 'User 4',
              email: 'user4@example.com'
            }
          }
        }))

    it('should validate a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createOneUser(
              input: {
                user: { name: "User 5", email: "This is not a valid email" }
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('email must be an email')
        }))
  })

  describe('create many', () => {
    it('should allow creating a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyUsers(
              input: {
                users: [
                  { name: "User 5", email: "user5@example.com" },
                  { name: "User 6", email: "user6@example.com" }
                ]
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200, {
          data: {
            createManyUsers: [
              { id: '5', name: 'User 5', email: 'user5@example.com' },
              { id: '6', name: 'User 6', email: 'user6@example.com' }
            ]
          }
        }))

    it('should validate a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            createManyUsers(
              input: {
                users: [{ name: "User 7", email: "This is not a valid email" }]
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('email must be an email')
        }))
  })

  describe('update one', () => {
    it('should allow updating a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneUser(
              input: {
                id: "6",
                update: { name: "User 6a", email: "user6a@example.com" }
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200, {
          data: {
            updateOneUser: {
              id: '6',
              name: 'User 6a',
              email: 'user6a@example.com'
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
            updateOneUser(
              input: {
                update: { name: "User X" }
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "UpdateOneUserInput.id" of required type "ID!" was not provided.')
        }))

    it('should validate an update', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateOneUser(
              input: {
                id: "6",
                update: { email: "This is not a valid email address" }
              }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(JSON.stringify(body.errors[0])).toContain('email must be an email')
        }))
  })

  describe('update many', () => {
    it('should allow updating a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyUsers(
              input: {
                filter: {id: { in: ["5", "6"]} },
                update: { name: "New Users" }
              }
            ) {
              updatedCount
            }
        }`
        })
        .expect(200, {
          data: {
            updateManyUsers: {
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
            updateManyUsers(
              input: {
                update: { name: "New users" }
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
            'Field "UpdateManyUsersInput.filter" of required type "UserUpdateFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            updateManyUsers(
              input: {
                filter: { },
                update: { name: "New users" }
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
    it('should allow deleting a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteOneUser(
              input: { id: "6" }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(200, {
          data: {
            deleteOneUser: {
              id: null,
              name: 'New Users',
              email: 'user6a@example.com'
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
            deleteOneUser(
              input: { }
            ) {
              id
              name
              email
            }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors).toHaveLength(1)
          expect(body.errors[0].message).toBe('Field "DeleteOneUserInput.id" of required type "ID!" was not provided.')
        }))
  })

  describe('delete many', () => {
    it('should allow deleting a user', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyUsers(
              input: {
                filter: {id: { in: ["4", "5"]} },
              }
            ) {
              deletedCount
            }
        }`
        })
        .expect(200, {
          data: {
            deleteManyUsers: {
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
            deleteManyUsers(
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
            'Field "DeleteManyUsersInput.filter" of required type "UserDeleteFilter!" was not provided.'
          )
        }))

    it('should require a non-empty filter', () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `mutation {
            deleteManyUsers(
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
