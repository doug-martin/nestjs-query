// import { Connection } from 'typeorm';
// import { SubTaskEntity } from '../src/sub-task/sub-task.entity';
//
// const tables = ['sub_task'];
// export const truncate = async (connection: Connection): Promise<void> => {
//   await tables.reduce(async (prev, table) => {
//     await prev;
//     return connection.query(`TRUNCATE ${table} RESTART IDENTITY CASCADE`);
//   }, Promise.resolve());
// };
//
// export const refresh = async (connection: Connection): Promise<void> => {
//   await truncate(connection);
//
//   const todoItemIds = [1, 2, 3, 4, 5];
//   const subTaskRepo = connection.getRepository(SubTaskEntity);
//
//   await subTaskRepo.save(
//     todoItems.reduce((subTasks, todo) => {
//       return [
//         ...subTasks,
//         { completed: true, title: `${todo.title} - Sub Task 1`, todoItemId: todo },
//         { completed: false, title: `${todo.title} - Sub Task 2`, todoItem: todo },
//         { completed: false, title: `${todo.title} - Sub Task 3`, todoItem: todo },
//       ];
//     }, [] as Partial<SubTaskEntity>[]),
//   );
// };
