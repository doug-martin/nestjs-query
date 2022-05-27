import { CursorConnectionType } from '@ptc-org/nestjs-query-graphql';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Connection } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TodoItemDTO } from '../src/todo-item/dto/todo-item.dto';
import { refresh } from './fixtures';
import { edgeNodes, pageInfoField, todoItemFields } from './graphql-fragments';

describe('TodoItemResolver (filters - e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true
      })
    );

    await app.init();
    await refresh(app.get(Connection));
  });

  afterAll(() => refresh(app.get(Connection)));

  describe('query', () => {
    it(`should require "completed" filter`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(400)
        .then(({ body }) => {
          expect(body.errors[0].message).toBe(
            'Field "todoItems" argument "filter" of type "TodoItemFilter!" is required, but it was not provided.'
          );
        }));

    it(`should accepted "completed" filter`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems (filter: { completed: { is: true } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo }: CursorConnectionType<TodoItemDTO> = body.data.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA='
          });
          expect(edges).toHaveLength(1);

          expect(edges.map((e) => e.node)).toEqual([
            { id: '1', title: 'Create Nest App', completed: true, description: null }
          ]);
        }));

    it(`should not accepted empty "completed" filter`, () =>
      request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          todoItems (filter: { completed: { } }) {
            ${pageInfoField}
            ${edgeNodes(todoItemFields)}
          }
        }`
        })
        .expect(200)
        .then(({ body }) => {
          expect(body.errors[0].extensions.response.message[0]).toBe(
            'filter.There was no filter provided for "completed"!'
          );
        }));
  });

  afterAll(async () => {
    await app.close();
  });
});
