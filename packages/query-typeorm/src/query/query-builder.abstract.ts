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
   * Escapes a string to be safe to in a query.
   * @param str - the string to escape.
   */
  protected escape(str: string): string {
    return this.repository.manager.connection.driver.escape(str);
  }
}
