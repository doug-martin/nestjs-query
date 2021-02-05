export const dbType = process.env.NESTJS_QUERY_DB_TYPE ?? 'postgres';
export const truncateSql = (table: string): string[] => {
  if (dbType === 'mysql') {
    return [`DELETE FROM \`${table}\``, `ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`];
  }
  return [`TRUNCATE "${table}" RESTART IDENTITY CASCADE`];
};

interface QueryExecutor {
  query(sql: string): Promise<unknown>;
}

export const asyncLoop = async <T>(items: T[], fn: (t: T) => Promise<unknown>): Promise<void> =>
  items.reduce(async (prev, item) => {
    await prev;
    await fn(item);
  }, Promise.resolve());

export const executeTruncate = (exec: QueryExecutor, table: string | string[]): Promise<void> => {
  if (Array.isArray(table)) {
    return asyncLoop(table, (t) => executeTruncate(exec, t));
  }
  const sqls = truncateSql(table);
  return asyncLoop(sqls, (sql) => exec.query(sql));
};
