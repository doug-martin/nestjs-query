import { EntityMetadata, Repository } from 'typeorm';

export abstract class AbstractQueryBuilder<Entity> {
  readonly entityMetadata: EntityMetadata;

  protected constructor(readonly repository: Repository<Entity>) {
    this.entityMetadata = this.repository.metadata;
  }

  fieldToDbCol<F extends keyof Entity>(field: F): string {
    const colMetaData = this.entityMetadata.findColumnWithPropertyName(field as string);
    if (!colMetaData) {
      return this.escape(field as string);
    }
    return this.escape(colMetaData.databasePath);
  }

  escape(str: string): string {
    return this.repository.manager.connection.driver.escape(str);
  }
}
