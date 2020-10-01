/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-assignment */
import { Connection, Types } from 'mongoose';
import { SubTaskEntity } from '../src/sub-task/sub-task.entity';
import { TagEntity } from '../src/tag/tag.entity';
import { TodoItemEntity } from '../src/todo-item/todo-item.entity';
import { asyncLoop } from '../../helpers';

const { ObjectId } = Types;
const documents = [TodoItemEntity.name, SubTaskEntity.name, TagEntity.name];
export const truncate = async (connection: Connection): Promise<void> =>
  asyncLoop(documents, (document) => {
    return connection.model(document).remove({}).exec();
  });

export const refresh = async (connection: Connection): Promise<void> => {
  await truncate(connection);

  const TodoModel = connection.model<TodoItemEntity>(TodoItemEntity.name);
  const TagsModel = connection.model<TagEntity>(TagEntity.name);
  const SubTaskModel = connection.model<SubTaskEntity>(SubTaskEntity.name);

  const urgentTag = await new TagsModel({
    _id: new ObjectId('5f74ed2686b2bae7bf4b4aab'),
    name: 'Urgent',
  }).save();
  const homeTag = await new TagsModel({ _id: new ObjectId('5f74ed2686b2bae7bf4b4aac'), name: 'Home' }).save();
  const workTag = await new TagsModel({ _id: new ObjectId('5f74ed2686b2bae7bf4b4aad'), name: 'Work' }).save();
  const questionTag = await new TagsModel({
    _id: new ObjectId('5f74ed2686b2bae7bf4b4aae'),
    name: 'Question',
  }).save();
  const blockedTag = await new TagsModel({
    _id: new ObjectId('5f74ed2686b2bae7bf4b4aaf'),
    name: 'Blocked',
  }).save();

  const todoItems = await Promise.all([
    new TodoModel({
      _id: new ObjectId('5f74af112fae2b251510e3ad'),
      title: 'Create Nest App',
      completed: true,
      priority: 0,
      tags: [urgentTag._id, homeTag._id],
    }).save(),
    new TodoModel({
      _id: new ObjectId('5f74af112fae2b251510e3ae'),
      title: 'Create Entity',
      completed: false,
      priority: 1,
      tags: [urgentTag._id, workTag._id],
    }).save(),
    new TodoModel({
      _id: new ObjectId('5f74af112fae2b251510e3af'),
      title: 'Create Entity Service',
      completed: false,
      priority: 2,
      tags: [blockedTag._id, workTag._id],
    }).save(),
    new TodoModel({
      _id: new ObjectId('5f74af112fae2b251510e3b0'),
      title: 'Add Todo Item Resolver',
      completed: false,
      priority: 3,
      tags: [blockedTag.id, homeTag.id],
    }).save(),
    new TodoModel({
      _id: new ObjectId('5f74af112fae2b251510e3b1'),
      title: 'How to create item With Sub Tasks',
      completed: false,
      priority: 4,
      tags: [questionTag.id, blockedTag.id],
    }).save(),
  ]);

  await Promise.all([
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31a'),
      completed: true,
      title: `${todoItems[0].title} - Sub Task 1`,
      todoItem: todoItems[0]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31b'),
      completed: false,
      title: `${todoItems[0].title} - Sub Task 2`,
      todoItem: todoItems[0]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31c'),
      completed: false,
      title: `${todoItems[0].title} - Sub Task 3`,
      todoItem: todoItems[0]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31d'),
      completed: true,
      title: `${todoItems[1].title} - Sub Task 1`,
      todoItem: todoItems[1]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31e'),
      completed: false,
      title: `${todoItems[1].title} - Sub Task 2`,
      todoItem: todoItems[1]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f31f'),
      completed: false,
      title: `${todoItems[1].title} - Sub Task 3`,
      todoItem: todoItems[1]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f320'),
      completed: true,
      title: `${todoItems[2].title} - Sub Task 1`,
      todoItem: todoItems[2]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f321'),
      completed: false,
      title: `${todoItems[2].title} - Sub Task 2`,
      todoItem: todoItems[2]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f322'),
      completed: false,
      title: `${todoItems[2].title} - Sub Task 3`,
      todoItem: todoItems[2]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f323'),
      completed: true,
      title: `${todoItems[3].title} - Sub Task 1`,
      todoItem: todoItems[3]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f324'),
      completed: false,
      title: `${todoItems[3].title} - Sub Task 2`,
      todoItem: todoItems[3]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f325'),
      completed: false,
      title: `${todoItems[3].title} - Sub Task 3`,
      todoItem: todoItems[3]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f326'),
      completed: true,
      title: `${todoItems[4].title} - Sub Task 1`,
      todoItem: todoItems[4]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f327'),
      completed: false,
      title: `${todoItems[4].title} - Sub Task 2`,
      todoItem: todoItems[4]._id,
    }).save(),
    new SubTaskModel({
      _id: new ObjectId('5f74ed936c3afaeaadb8f328'),
      completed: false,
      title: `${todoItems[4].title} - Sub Task 3`,
      todoItem: todoItems[4]._id,
    }).save(),
  ]);
};
