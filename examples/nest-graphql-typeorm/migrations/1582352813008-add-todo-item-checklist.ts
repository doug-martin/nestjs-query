import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTodoItemChecklist1582352813008 implements MigrationInterface {
  name = 'addTodoItemChecklist1582352813008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todo_item_entity" ADD "checklist" jsonb`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tag_entity" ADD "description" character varying`, undefined);
  }
}
