export const dbType = process.env.NESTJS_QUERY_DB_TYPE ?? 'postgres'
export const truncateSql = (table: string): string[] => {
  if (dbType === 'mysql') {
    return [
      `SET foreign_key_checks = 0;`,
      `DELETE
       FROM \`${table}\``,
      `ALTER TABLE \`${table}\` AUTO_INCREMENT = 1`,
      `SET foreign_key_checks = 1;`
    ]
  }
  return [`TRUNCATE "${table}" RESTART IDENTITY CASCADE`]
}

interface QueryExecutor {
  query(sql: string): Promise<unknown>
}

export const asyncLoop = async <T>(items: T[], fn: (t: T) => Promise<unknown>): Promise<void> => {
  try {
    for (const item of items) {
      await fn(item)
    }
  } catch (err) {
    console.error(err)

    throw err
  }
}

export const executeTruncate = (exec: QueryExecutor, table: string | string[]): Promise<void> => {
  if (Array.isArray(table)) {
    return asyncLoop(table, (t) => executeTruncate(exec, t))
  }

  return asyncLoop(truncateSql(table), (sql) => exec.query(sql))
}
