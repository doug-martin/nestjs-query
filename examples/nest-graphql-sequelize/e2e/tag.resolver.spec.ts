import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import request from 'supertest';
import { INestApplication, ValidationPipe, BadRequestException } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { refresh } from './fixtures';
import { edgeNodes, pageInfoField, tagFields, todoItemFields } from './graphql-fragments';

describe('TagResolver (sequelize - e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory: (errors) => new BadRequestException(errors),
        forbidNonWhitelisted: true,
        skipMissingProperties: false,
        forbidUnknownValues: true,
      }),
    );

    await app.init();
    await refresh(app.get(Sequelize));
  });

  afterAll(() => refresh(app.get(Sequelize)));

  const tags = [
    { id: '1', name: 'Urgent' },
    { id: '2', name: 'Home' },
    { id: '3', name: 'Work' },
    { id: '4', name: 'Question' },
    { id: '5', name: 'Blocked' },
  ];

  describe('find one', () => {
    it(`should find a tag by id`, () => {
      return request(app.getHttpServer())
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
        .expect(200, { data: { tag: tags[0] } });
    });

    it(`should return null if the tag is not found`, () => {
      return request(app.getHttpServer())
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
        });
    });

    it(`should return todoItems as a connection`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tag(id: 1) {
            todoItems(sorting: [{ field: id, direction: ASC }]) {
              ${pageInfoField}
              ${edgeNodes('id')}
            }
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.tag.todoItems;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(edges).toHaveLength(2);
          // @ts-ignore
          expect(edges.map((e) => e.node.id)).toEqual(['1', '2']);
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
          tags {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(edges).toHaveLength(5);
          // @ts-ignore
          expect(edges.map((e) => e.node)).toEqual(tags);
        });
    });

    it(`should allow querying`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(filter: { id: { in: [1, 2, 3] } }) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(edges).toHaveLength(3);
          // @ts-ignore
          expect(edges.map((e) => e.node)).toEqual(tags.slice(0, 3));
        });
    });

    it(`should allow sorting`, () => {
      return request(app.getHttpServer())
        .post('/graphql')
        .send({
          operationName: null,
          variables: {},
          query: `{
          tags(sorting: [{field: id, direction: DESC}]) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
          }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.tags;
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          expect(edges).toHaveLength(5);
          // @ts-ignore
          expect(edges.map((e) => e.node)).toEqual(tags.slice().reverse());
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
          tags(paging: {first: 2}) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo } = body.data.tags;
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
            });
            expect(edges).toHaveLength(2);
            // @ts-ignore
            expect(edges.map((e) => e.node)).toEqual(tags.slice(0, 2));
          });
      });

      it(`should allow paging with the 'first' field and 'after'`, () => {
        return request(app.getHttpServer())
          .post('/graphql')
          .send({
            operationName: null,
            variables: {},
            query: `{
          tags(paging: {first: 2, after: "YXJyYXljb25uZWN0aW9uOjE="}) {
            ${pageInfoField}
            ${edgeNodes(tagFields)}
          }
        }`,
          })
          .expect(200)
          .then(({ body }) => {
            const { edges, pageInfo } = body.data.tags;
            expect(pageInfo).toEqual({
              endCursor: 'YXJyYXljb25uZWN0aW9uOjM=',
              hasNextPage: true,
              hasPreviousPage: false,
              startCursor: 'YXJyYXljb25uZWN0aW9uOjI=',
            });
            expect(edges).toHaveLength(2);
            // @ts-ignore
            expect(edges.map((e) => e.node)).toEqual(tags.slice(2, 4));
          });
      });
    });
  });

  describe('create one', () => {
    it('should allow creating a tag', () => {
      return request(app.getHttpServer())
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
        });
    });

    it('should validate a tag', () => {
      return request(app.getHttpServer())
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
        });
    });
  });

  describe('create many', () => {
    it('should allow creating a tag', () => {
      return request(app.getHttpServer())
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
        });
    });

    it('should validate a tag', () => {
      return request(app.getHttpServer())
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
        });
    });
  });

  describe('update one', () => {
    it('should allow updating a tag', () => {
      return request(app.getHttpServer())
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
        });
    });

    it('should require an id', () => {
      return request(app.getHttpServer())
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
          expect(JSON.stringify(body.errors[0])).toContain(
            'Field UpdateOneTagInput.id of required type ID! was not provided.',
          );
        });
    });

    it('should validate an update', () => {
      return request(app.getHttpServer())
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
        });
    });
  });

  describe('update many', () => {
    it('should allow updating a tag', () => {
      return request(app.getHttpServer())
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
        });
    });

    it('should require a filter', () => {
      return request(app.getHttpServer())
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
          expect(JSON.stringify(body.errors[0])).toContain(
            'Field UpdateManyTagsInput.filter of required type TagFilter! was not provided.',
          );
        });
    });

    it('should require a non-empty filter', () => {
      return request(app.getHttpServer())
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
        });
    });
  });

  describe('delete one', () => {
    it('should allow deleting a tag', () => {
      return request(app.getHttpServer())
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
              id: '6',
              name: 'Update Test Tag',
            },
          },
        });
    });

    it('should require an id', () => {
      return request(app.getHttpServer())
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
          expect(JSON.stringify(body.errors[0])).toContain(
            'Field DeleteOneInput.id of required type ID! was not provided.',
          );
        });
    });
  });

  describe('delete many', () => {
    it('should allow updating a tag', () => {
      return request(app.getHttpServer())
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
        });
    });

    it('should require a filter', () => {
      return request(app.getHttpServer())
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
          expect(JSON.stringify(body.errors[0])).toContain(
            'Field DeleteManyTagsInput.filter of required type TagFilter! was not provided.',
          );
        });
    });

    it('should require a non-empty filter', () => {
      return request(app.getHttpServer())
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
        });
    });
  });

  describe('addTodoItemsToTag', () => {
    it('allow adding subTasks to a tag', () => {
      return request(app.getHttpServer())
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
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.addTodoItemsToTag.todoItems;
          expect(body.data.addTodoItemsToTag.id).toBe('1');
          expect(edges).toHaveLength(5);
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjQ=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          // @ts-ignore
          expect(edges.map((e) => e.node.title)).toEqual([
            'Create Nest App',
            'Create Entity',
            'Create Entity Service',
            'Add Todo Item Resolver',
            'How to create item With Sub Tasks',
          ]);
        });
    });
  });

  describe('removeTodoItemsFromTag', () => {
    it('allow removing todoItems from a tag', () => {
      return request(app.getHttpServer())
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
              }
            }
        }`,
        })
        .expect(200)
        .then(({ body }) => {
          const { edges, pageInfo } = body.data.removeTodoItemsFromTag.todoItems;
          expect(body.data.removeTodoItemsFromTag.id).toBe('1');
          expect(edges).toHaveLength(2);
          expect(pageInfo).toEqual({
            endCursor: 'YXJyYXljb25uZWN0aW9uOjE=',
            hasNextPage: false,
            hasPreviousPage: false,
            startCursor: 'YXJyYXljb25uZWN0aW9uOjA=',
          });
          // @ts-ignore
          expect(edges.map((e) => e.node.title)).toEqual(['Create Nest App', 'Create Entity']);
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
