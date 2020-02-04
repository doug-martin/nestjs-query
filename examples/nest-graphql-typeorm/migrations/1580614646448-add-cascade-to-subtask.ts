import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCascadeToSubtask1580614646448 implements MigrationInterface {
  name = 'addCascadeToSubtask1580614646448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" DROP CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "sub_task_entity" ALTER COLUMN "todoItemId" SET NOT NULL`, undefined);
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" ADD CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5" FOREIGN KEY ("todoItemId") REFERENCES "todo_item_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" DROP CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "sub_task_entity" ALTER COLUMN "todoItemId" DROP NOT NULL`, undefined);
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" ADD CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5" FOREIGN KEY ("todoItemId") REFERENCES "todo_item_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}
