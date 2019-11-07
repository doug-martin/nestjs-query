import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { TodoItemEntity } from './src/todo-item/todo-item.entity';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(TodoItemEntity)
      .values([
        { title: 'Create Nest App', completed: true },
        { title: 'Create Entity', completed: false },
        { title: 'Create Entity Service', completed: false },
        { title: 'Add Todo Item Resolver', completed: false },
      ])
      .execute();
  }
}
