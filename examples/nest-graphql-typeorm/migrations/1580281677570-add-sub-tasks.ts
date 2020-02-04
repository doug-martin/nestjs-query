import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubTasks1580281677570 implements MigrationInterface {
  name = 'addSubTasks1580281677570';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "sub_task_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "completed" boolean NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), "todoItemId" integer, CONSTRAINT "PK_e267efd95c995719ea7c08ae840" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "todo_item_entity" ALTER COLUMN "created" SET DEFAULT now()`, undefined);
    await queryRunner.query(`ALTER TABLE "todo_item_entity" ALTER COLUMN "updated" SET DEFAULT now()`, undefined);
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" ADD CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5" FOREIGN KEY ("todoItemId") REFERENCES "todo_item_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sub_task_entity" DROP CONSTRAINT "FK_926446bfca9afe30fd0eea83ce5"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity" ALTER COLUMN "updated" SET DEFAULT CURRENT_TIMESTAMP`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity" ALTER COLUMN "created" SET DEFAULT CURRENT_TIMESTAMP`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "sub_task_entity"`, undefined);
  }
}
