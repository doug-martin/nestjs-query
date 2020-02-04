import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { SubTaskEntity } from './src/sub-task/sub-task.entity';
import { TodoItemEntity } from './src/todo-item/todo-item.entity';

export default class CreateUsers implements Seeder {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const todoRepo = connection.getRepository(TodoItemEntity);
    const subTaskRepo = connection.getRepository(SubTaskEntity);
    await todoRepo.insert([
      { title: 'Create Nest App', completed: true },
      { title: 'Create Entity', completed: false },
      { title: 'Create Entity Service', completed: false },
      { title: 'Add Todo Item Resolver', completed: false },
      {
        title: 'Item With Sub Tasks',
        completed: false,
      },
    ]);

    const todos = await todoRepo.find();
    await Promise.all(
      todos.map(async todo => {
        await subTaskRepo.insert([
          { completed: true, title: `${todo.title} - Sub Task 1`, todoItem: todo },
          { completed: false, title: `${todo.title} -Sub Task 2`, todoItem: todo },
          { completed: false, title: `${todo.title} -Sub Task 3`, todoItem: todo },
        ]);
      }),
    );
  }
}
