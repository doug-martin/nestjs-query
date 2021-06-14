import { Sequelize } from 'sequelize-typescript';
import { truncate } from './sequelize.fixture';

import { TestRelation } from './test-relation.entity';
import { TestEntity } from './test.entity';

export const PLAIN_TEST_ENTITIES: Pick<
  TestEntity,
  'testEntityPk' | 'boolType' | 'dateType' | 'numberType' | 'stringType'
>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  const testEntityPk = `test-entity-${i}`;
  return {
    testEntityPk,
    boolType: i % 2 === 0,
    dateType: new Date(`2020-02-${i}`),
    numberType: i,
    stringType: `foo${i}`,
  };
});

export const PLAIN_TEST_RELATIONS: Pick<TestRelation, 'testRelationPk' | 'relationName' | 'testEntityId'>[] =
  PLAIN_TEST_ENTITIES.reduce(
    (relations, te) => [
      ...relations,
      {
        testRelationPk: `test-relations-${te.testEntityPk}-1`,
        relationName: `${te.stringType}-test-relation-one`,
        testEntityId: te.testEntityPk,
        oneTestEntityId: te.testEntityPk,
      },
      {
        testRelationPk: `test-relations-${te.testEntityPk}-2`,
        relationName: `${te.stringType}-test-relation-two`,
        testEntityId: te.testEntityPk,
        oneTestEntityId: null,
      },
      {
        testRelationPk: `test-relations-${te.testEntityPk}-3`,
        relationName: `${te.stringType}-test-relation-three`,
        testEntityId: te.testEntityPk,
        oneTestEntityId: null,
      },
    ],
    [] as Pick<TestRelation, 'testRelationPk' | 'relationName' | 'testEntityId'>[],
  );

export const seed = async (sequelize: Sequelize): Promise<void> => {
  await truncate(sequelize);

  await TestEntity.bulkCreate(PLAIN_TEST_ENTITIES);
  await TestRelation.bulkCreate(PLAIN_TEST_RELATIONS);
};
