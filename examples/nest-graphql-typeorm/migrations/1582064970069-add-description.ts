import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDescription1582064970069 implements MigrationInterface {
  name = 'addDescription1582064970069';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "todo_item_entity" ADD "description" character varying`, undefined);
    await queryRunner.query(`ALTER TABLE "sub_task_entity" ADD "description" character varying`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "sub_task_entity" DROP COLUMN "description"`, undefined);
    await queryRunner.query(`ALTER TABLE "todo_item_entity" DROP COLUMN "description"`, undefined);
  }
}
