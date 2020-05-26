import { Connection } from 'typeorm';
import { SubTaskEntity } from '../src/sub-task/sub-task.entity';
import { TagEntity } from '../src/tag/tag.entity';
import { TodoItemEntity } from '../src/todo-item/todo-item.entity';

const tables = ['todo_item', 'sub_task', 'tag'];
export const truncate = async (connection: Connection): Promise<void> => {
  await tables.reduce(async (prev, table) => {
    await prev;
    await connection.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
  }, Promise.resolve());
};

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection);

  const todoRepo = connection.getRepository(TodoItemEntity);
  const subTaskRepo = connection.getRepository(SubTaskEntity);
  const tagsRepo = connection.getRepository(TagEntity);

  const urgentTag = await tagsRepo.save({ name: 'Urgent' });
  const homeTag = await tagsRepo.save({ name: 'Home' });
  const workTag = await tagsRepo.save({ name: 'Work' });
  const questionTag = await tagsRepo.save({ name: 'Question' });
  const blockedTag = await tagsRepo.save({ name: 'Blocked' });

  const todoItems = await todoRepo.save([
    { title: 'Create Nest App', completed: true, priority: 0, tags: [urgentTag, homeTag] },
    { title: 'Create Entity', completed: false, priority: 1, tags: [urgentTag, workTag] },
    { title: 'Create Entity Service', completed: false, priority: 2, tags: [blockedTag, workTag] },
    { title: 'Add Todo Item Resolver', completed: false, priority: 3, tags: [blockedTag, homeTag] },
    {
      title: 'How to create item With Sub Tasks',
      completed: false,
      priority: 4,
      tags: [questionTag, blockedTag],
    },
  ]);

  await subTaskRepo.save(
    todoItems.reduce((subTasks, todo) => {
      return [
        ...subTasks,
        { completed: true, title: `${todo.title} - Sub Task 1`, todoItem: todo },
        { completed: false, title: `${todo.title} - Sub Task 2`, todoItem: todo },
        { completed: false, title: `${todo.title} - Sub Task 3`, todoItem: todo },
      ];
    }, [] as Partial<SubTaskEntity>[]),
  );
};
