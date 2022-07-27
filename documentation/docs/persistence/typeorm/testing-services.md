---
title: Testing Services
---

It is possible to test services that use `TypeOrmQueryService`. The process is similar to the one described for [nestjs](https://docs.nestjs.com/techniques/database#testing), but it has a few differences.

Let's assume we have the following `TodoItem` service. For the sake of completeness, let's also add a dependency on another service (let's pretend that the todos have subTasks; we are not using relationships here):

```ts title="todo-item.service.ts"
import { InjectQueryService, QueryService } from '@codeshine/nestjs-query-core';
import { TypeOrmQueryService } from '@codeshine/nestjs-query-query-typeorm';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { SubTaskEntity } from '../sub-task/sub-task.entity';
import { TodoItemEntity } from './todo-item.entity';

@QueryService(TodoItemEntity)
export class TodoItemService extends TypeOrmQueryService<TodoItemEntity> {
  constructor(
    @InjectRepository(TodoItemEntity) private todosRepository: Repository<TodoItemEntity>,
    @InjectQueryService(SubTaskEntity) private subTaskService: QueryService<SubTaskEntity>,
  ) {
    super(todosRepository);
  }

  async getWithSubTasks(id: number): Promise<{ todoItem: TodoItemEntity; subTasks: SubTaskEntity[] }> {
    const todoItem = await this.todosRepository.findOneOrFail(id);
    const subTasks = await this.subTaskService.query({ filter: { todoItemId: { eq: id } } });
    return { todoItem, subTasks };
  }
}
```

Now lets write some tests!

```ts title="todo-item.service.spec.ts"
import { Test, TestingModule } from '@nestjs/testing';
import { getQueryServiceToken } from '@codeshine/nestjs-query-core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';
import { TodoItemEntity } from '../src/todo-item/todo-item.entity';
import { SubTaskEntity } from '../src/sub-task/sub-task.entity';
import { TodoItemService } from '../src/todo-item/todo-item.service';

// We create some fake entiites, just for testing. Here they are empty,
// but they can be more complex, depending on the testing cases.
const subTasks = [new SubTaskEntity(), new SubTaskEntity(), new SubTaskEntity()];
const oneTodo: TodoItemEntity = plainToClass(TodoItemEntity, { id: 1, title: 'A test todo' });

describe('TodosItemService', () => {
  let service: TodoItemService; // Removed type, compared to the nestjs examples

  // We mock the responses of the two services.
  // The mocks in this example are very simple, but they can be more complex, depending on the test cases.

  const mockedSubTaskService = {
    // mock the query method that is used by getWithSubTasks
    query: jest.fn((query) => Promise.resolve(subTasks)),
  };
  const mockedRepo = {
    // mock the repo `findOneOrFail`
    findOneOrFail: jest.fn((id) => Promise.resolve(oneTodo)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Provide the original service
        TodoItemService,
        // Mock the repository using the `getRepositoryToken` from @nestjs/typeorm
        {
          provide: getRepositoryToken(TodoItemEntity),
          useValue: mockedRepo,
        },
        // Mock the SubTask QueryService using the `getQueryServiceToken` from @codeshine/nestjs-query-core
        {
          provide: getQueryServiceToken(SubTaskEntity),
          useValue: mockedSubTaskService,
        },
      ],
    }).compile();
    // get the service from the testing module.
    service = await module.get(TodoItemService);
  });

  // reset call counts and called with arguments after each spec
  afterEach(() => jest.clearAllMocks());

  // Now we are ready to write the tests.
  describe('getWithSubTasks', () => {
    it('should return a TodoItem with subTasks', async () => {
      // We can use jest spies to inspect if functions are called ...

      // create a spy for the repository findOneOrFail method
      const findOneOrFailSpy = jest.spyOn(mockedRepo, 'findOneOrFail');
      // create a spy for the mocked subTaskService query method
      const querySpy = jest.spyOn(mockedSubTaskService, 'query');

      // When we call a service function the following things happen:
      // - the real service function is called, so we can test its code
      // - the mocked repository method is called
      // - the mocked subTask query service method is called
      // note that if the service calls a function in a repo or query service that is not defined by a mock, the test
      // will fail
      const todo = await service.getWithSubTasks(oneTodo.id);
      // check the result against the expected results
      expect(todo).toEqual({ todoItem: oneTodo, subTasks });

      // Ensure that the spies are called once with the appropriate arguments
      expect(findOneOrFailSpy).toHaveBeenCalledTimes(1);
      expect(findOneOrFailSpy).toHaveBeenCalledWith(oneTodo.id);
      expect(querySpy).toHaveBeenCalledTimes(1);
      expect(querySpy).toHaveBeenCalledWith({ filter: { todoItemId: { eq: oneTodo.id } } });
    });
  });
});
```

## Mocking Inherited Methods

You can also mock inherited methods.

Let's change the `getWithSubTasks` method from the `TodoItemService` to use the `getById` method from the parent `TypeOrmQueryService`

```ts
async getWithSubTasks(id: number): Promise<{ todoItem: TodoItemEntity; subTasks: SubTaskEntity[] }> {
  const todoItem = await this.getById(id);
  const subTasks = await this.subTaskService.query({ filter: { todoItemId: { eq: id } } });
  return { todoItem, subTasks };
}
```

To mock the `getById` method we can create a new `spy` with a mock implementation

```ts
const getByIdSpy = jest.spyOn(service, 'getById').mockImplementation(() => Promise.resolve(oneTodo));
```

Lets update our tests to mock out the `getById` implementation

```ts
describe('getWithSubTasks', () => {
  it('should return a TodoItem with subTasks', async () => {
    // We can use jest spies to inspect if functions are called ...

    // create a mock implementation for getById on the service
    const getByIdSpy = jest.spyOn(service, 'getById').mockImplementation(() => Promise.resolve(oneTodo));
    // create a spy for the mocked subTaskService query method
    const querySpy = jest.spyOn(mockedSubTaskService, 'query');

    // When we call a service function the following things happen:
    // - the real service function is called, so we can test its code
    // - the mock todoItem query service method is called
    // - the mocked subTask query service method is called
    // note that if the service calls a function in a repo or query service that is not defined by a mock, the test
    // will fail
    const todo = await service.getWithSubTasks(oneTodo.id);
    // check the result against the expected results
    expect(todo).toEqual({ todoItem: oneTodo, subTasks });

    // Ensure that the spies are called once with the appropriate arguments
    expect(getByIdSpy).toHaveBeenCalledTimes(1);
    expect(getByIdSpy).toHaveBeenCalledWith(oneTodo.id);
    expect(querySpy).toHaveBeenCalledTimes(1);
    expect(querySpy).toHaveBeenCalledWith({ filter: { todoItemId: { eq: oneTodo.id } } });
  });

  it('should reject if the getById rejects with an error', async () => {
    // We can use jest spies to inspect if functions are called ...

    // create a mock implementation for the service getById method
    const getByIdSpy = jest.spyOn(service, 'getById').mockImplementation(() => Promise.reject(new Error('foo')));
    // create a spy for the mocked subTaskService query method
    const querySpy = jest.spyOn(mockedSubTaskService, 'query');

    // When we call a service function the following things happen:
    // - the real service function is called, so we can test its code
    // - the mocked repository method is called
    // - the mocked subTask query service method is called
    // note that if the service calls a function in a repo or query service that is not defined by a mock, the test
    // will fail
    await expect(service.getWithSubTasks(oneTodo.id)).rejects.toThrow('foo');

    // Ensure that the getById spy is called one
    expect(getByIdSpy).toHaveBeenCalledTimes(1);
    expect(getByIdSpy).toHaveBeenCalledWith(oneTodo.id);
    // Ensure that that the querySpy was not called
    expect(querySpy).not.toHaveBeenCalled();
  });
});
```
