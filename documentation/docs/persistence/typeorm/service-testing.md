---
title: Service Testing
---

It is possible to test services that use `TypeOrmQueryService`. The process is similar to the one described for `nestjs`, but it has a few differences.

Let's assume we have the following TODO service. For the sake of completeness, let's also add a dependency on anther service (let's pretend that the todos have tags; we are not using relationships here):

```ts title="todo-item.service.ts"
import { REQUEST } from '@nestjs/core';
import { Injectable, Scope, Inject } from '@nestjs/common';
import { Query, QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, getConnection } from 'typeorm';

import { TodoItemEntity } from './toyo-entitu.entity';
import { TagsService } from '../tags/tags.service';
import { TagEntity } from '../tags/tag.entity';

@QueryService(TodoItemEntity)
@Injectable({ scope: Scope.REQUEST })
export class TodoItemsService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(
    @InjectRepository(TodoItemEntity)
    private todosRepository: Repository<TodoItemEntity>,
    private tagsService: TagsService,
  ) {
    super();
  }

  async getById(id: number) {
    const todo = await this.query({filter: {id}});
    const tags = await this.tagsService.query({filter: {todoId: id}})
    todo.tags = tags;

    return todo;
  }
}
```

We can write tests as (note that the comment refers to the differences respect to the plain nestjs testing):

```ts title="todo-item.service.spec.ts"
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';

import { TodoItemEntity } from './todo-item.entity';
import { TodoItemService } from './todo-items.service';

import { TagEntity } from '../tags/tag.entity';
import { TagsService } from '../tags/tags.service';

// We create some fake entiites, just for testing. Here they are empty,
// but they can be more complex, depending on the testing cases.
const tagsArray = [
  new TagEntity(),
  new TagEntity(),
  new TagEntity(),
];
const oneTodo = new TodoItemEntity({id: 1, title: "A test todo"});

describe('Todos Service', () => {
  let service; // Removed type, compared to the nestjs examples
  let repo: Repository<TodoItemEntity>;
  let tagsRepo: Repository<TagsService>; // This is the other service used by TodoItemService

  // We mock the responses of the two services. We will use these mocks later,
  // in the createTestingModule. We use the standard Jest mock functions here.
  // Here they are very simple, but they can be more complex, depending on the testing cases.
  let mockedRepo = {
    query: jest.fn(filter => oneTodo),
  };

  let mockedTagsRepo = {
    findByTodo: jest.fn(id => tagsArray,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // we mock both the services. To do this we use the syntax
        // ServiceToMock, {options} and inside options
        // we must pass `provide` and `useValue` keys.
        // we do the TodoItemsService ...
        TodoItemService,
        {
          provide: getRepositoryToken(TodoItemEntity),
          useValue: mockedRepo,
        },
        // ... and the TagsService
        TagsService,
        {
          provide: getRepositoryToken(TagEntity),
          useValue: mockedTagsRepo,
        },
        // We must also pass TypeOrmQueryService
        TypeOrmQueryService,
      ],
    }).compile();

    // Here we retrieve from the module the handles to the repos
    service = await module.get(TodoItemService);
    repo = await module.get<Repository<TodoItemEntity>>(
      getRepositoryToken(TodoItemEntity),
    );
    tagsRepo = await module.get<Repository<TagEntity>>(
      getRepositoryToken(TagEntity),
    );

    // We must manually set the following because extending TypeOrmQueryService seems to break it
    Object.keys(mockedRepo).forEach(f => (service[f] = mockedRepo[f]));
    service.todosRepository = repo;
    service.tagsService = tagsRepo;
  });

  // Now we are ready to write the tests.
  describe('getById', () => {
    it('should return a TodoItem', async () => {
      // We can use jest spies to inspect if functions are called ...
      const repoSpy = jest.spyOn(mockedRepo, 'find');
      // When we call a service function the following things happen:
      // - the real service function is called, so we can test its code
      // - the mocked repositories functions are called, so we can control the environment
      // note that if the service calls a function in a repo which is not defined by a mock, the test will fail
      const todo = await service.getById();
      const expectedTodo = {...oneTodo, tags: tagsArray};
      // or we can check that the return values are correct
      expect(todo).toEqual(expectedTodo);
      // and we can check that the spies are called how we expect
      expect(repoSpy).toBeCalledTimes(1);
      expect(repoSpy).toBeCalledWith(oneTodo.id);
    });
  });
```
