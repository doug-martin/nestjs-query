import { EntityMetadata, Repository } from 'typeorm';

/**
 * @internal
 *
 * Base class for all QueryBuilders.
 */
export abstract class AbstractQueryBuilder<Entity> {
  readonly entityMetadata: EntityMetadata;

  protected constructor(readonly repository: Repository<Entity>) {
    this.entityMetadata = this.repository.metadata;
  }

  /**
   * Convert a field to the typeorm column name.
   *
   * @param field - the property name on the entity.
   */
  fieldToDbCol<F extends keyof Entity>(field: F): string {
    const colMetaData = this.entityMetadata.findColumnWithPropertyName(field as string);
    if (!colMetaData) {
      return this.escape(field as string);
    }
    return this.escape(colMetaData.databasePath);
  }

  /**
   * Escapes a string to be safe to in a query.
   * @param str - the string to escape.
   */
  private escape(str: string): string {
    return this.repository.manager.connection.driver.escape(str);
  }
}
