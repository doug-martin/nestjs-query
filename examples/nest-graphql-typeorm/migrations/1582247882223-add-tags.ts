import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTags1582247882223 implements MigrationInterface {
  name = 'addTags1582247882223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tag_entity" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT now(), "updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_98efc66e2a1ce7fa1425e21e468" PRIMARY KEY ("id"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE TABLE "todo_item_entity_tags_tag_entity" ("todoItemEntityId" integer NOT NULL, "tagEntityId" integer NOT NULL, CONSTRAINT "PK_94429fb08ba42da04ec7406856a" PRIMARY KEY ("todoItemEntityId", "tagEntityId"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a6d2a53738864fb10eb37ce9d" ON "todo_item_entity_tags_tag_entity" ("todoItemEntityId") `,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c0a43db816c8bd89e60424458" ON "todo_item_entity_tags_tag_entity" ("tagEntityId") `,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity_tags_tag_entity" ADD CONSTRAINT "FK_5a6d2a53738864fb10eb37ce9d2" FOREIGN KEY ("todoItemEntityId") REFERENCES "todo_item_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity_tags_tag_entity" ADD CONSTRAINT "FK_6c0a43db816c8bd89e604244587" FOREIGN KEY ("tagEntityId") REFERENCES "tag_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity_tags_tag_entity" DROP CONSTRAINT "FK_6c0a43db816c8bd89e604244587"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "todo_item_entity_tags_tag_entity" DROP CONSTRAINT "FK_5a6d2a53738864fb10eb37ce9d2"`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX "IDX_6c0a43db816c8bd89e60424458"`, undefined);
    await queryRunner.query(`DROP INDEX "IDX_5a6d2a53738864fb10eb37ce9d"`, undefined);
    await queryRunner.query(`DROP TABLE "todo_item_entity_tags_tag_entity"`, undefined);
    await queryRunner.query(`DROP TABLE "tag_entity"`, undefined);
  }
}
