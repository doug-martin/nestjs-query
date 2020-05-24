import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { refresh } from './e2e/fixtures';

// default export needed for typeorm-seeding
// eslint-disable-next-line import/no-default-export
export default class CreateTodoItems implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await refresh(connection);
  }
}
