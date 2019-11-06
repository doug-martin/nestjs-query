import {MigrationInterface, QueryRunner} from "typeorm";

export class createTables1572928650276 implements MigrationInterface {
    name = 'createTables1572928650276'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "todo_item_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "completed" boolean NOT NULL, "created" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PK_abf610d3d128dd3e1f985582715" PRIMARY KEY ("id"))`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "todo_item_entity"`, undefined);
    }

}
