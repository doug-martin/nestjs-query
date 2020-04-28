import { Sequelize } from 'sequelize';
import { SubTaskEntity } from '../src/sub-task/sub-task.entity';
import { TagEntity } from '../src/tag/tag.entity';
import { TodoItemEntity } from '../src/todo-item/entity/todo-item.entity';

export const truncate = async (sequelize: Sequelize): Promise<void> => {
  await sequelize.truncate({ cascade: true, restartIdentity: true });
};

export const refresh = async (connection: Sequelize): Promise<void> => {
  await truncate(connection);

  const [urgentTag, homeTag, workTag, questionTag, blockedTag] = await TagEntity.bulkCreate([
    { name: 'Urgent' },
    { name: 'Home' },
    { name: 'Work' },
    { name: 'Question' },
    { name: 'Blocked' },
  ]);
  const todoItems = await TodoItemEntity.bulkCreate([
    { title: 'Create Nest App', completed: true, tags: [urgentTag, homeTag] },
    { title: 'Create Entity', completed: false, tags: [urgentTag, workTag] },
    { title: 'Create Entity Service', completed: false, tags: [blockedTag, workTag] },
    { title: 'Add Todo Item Resolver', completed: false, tags: [blockedTag, homeTag] },
    {
      title: 'How to create item With Sub Tasks',
      completed: false,
      tags: [questionTag, blockedTag],
    },
  ]);
  todoItems[0].$set('tags', [urgentTag, homeTag]);
  todoItems[1].$set('tags', [urgentTag, workTag]);
  todoItems[2].$set('tags', [blockedTag, workTag]);
  todoItems[3].$set('tags', [blockedTag, homeTag]);
  todoItems[4].$set('tags', [questionTag, blockedTag]);

  await todoItems.reduce(async (prev, todo) => {
    await prev;
    const subTasks = await SubTaskEntity.bulkCreate([
      { completed: true, title: `${todo.title} - Sub Task 1` },
      { completed: false, title: `${todo.title} - Sub Task 2` },
      { completed: false, title: `${todo.title} - Sub Task 3` },
    ]);
    await todo.$set('subTasks', subTasks);
  }, Promise.resolve());
};
