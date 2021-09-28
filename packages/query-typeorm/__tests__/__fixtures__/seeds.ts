import { Connection, getConnection } from 'typeorm';
import { TestRelation } from './test-relation.entity';
import { TestSoftDeleteEntity } from './test-soft-delete.entity';
import { TestEntity } from './test.entity';
import { RelationOfTestRelationEntity } from './relation-of-test-relation.entity';

export const TEST_ENTITIES: TestEntity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  const testEntityPk = `test-entity-${i}`;
  return {
    testEntityPk,
    boolType: i % 2 === 0,
    dateType: new Date(`2020-02-${i}`),
    numberType: i,
    stringType: `foo${i}`,
  };
});

export const TEST_SOFT_DELETE_ENTITIES: TestSoftDeleteEntity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  const testEntityPk = `test-entity-${i}`;
  return {
    testEntityPk,
    stringType: `foo${i}`,
  };
});

export const TEST_RELATIONS: TestRelation[] = TEST_ENTITIES.reduce(
  (relations, te) => [
    ...relations,
    {
      testRelationPk: `test-relations-${te.testEntityPk}-1`,
      relationName: `${te.stringType}-test-relation-one`,
      testEntityId: te.testEntityPk,
      uniDirectionalTestEntityId: te.testEntityPk,
    },
    {
      testRelationPk: `test-relations-${te.testEntityPk}-2`,
      relationName: `${te.stringType}-test-relation-two`,
      testEntityId: te.testEntityPk,
      uniDirectionalTestEntityId: te.testEntityPk,
    },
    {
      testRelationPk: `test-relations-${te.testEntityPk}-3`,
      relationName: `${te.stringType}-test-relation-three`,
      testEntityId: te.testEntityPk,
      uniDirectionalTestEntityId: te.testEntityPk,
    },
  ],
  [] as TestRelation[],
);

export const TEST_RELATIONS_OF_RELATION = TEST_RELATIONS.map<Partial<RelationOfTestRelationEntity>>((testRelation) => ({
  relationName: `test-relation-of-${testRelation.relationName}`,
  id: `relation-of-test-relation-${testRelation.relationName}`,
  testRelationId: testRelation.testRelationPk,
})) as RelationOfTestRelationEntity[];

export const seed = async (connection: Connection = getConnection()): Promise<void> => {
  const testEntityRepo = connection.getRepository(TestEntity);
  const testRelationRepo = connection.getRepository(TestRelation);
  const relationOfTestRelationRepo = connection.getRepository(RelationOfTestRelationEntity);
  const testSoftDeleteRepo = connection.getRepository(TestSoftDeleteEntity);

  const testEntities = await testEntityRepo.save(TEST_ENTITIES.map((e: TestEntity) => ({ ...e })));

  const testRelations = await testRelationRepo.save(TEST_RELATIONS.map((r: TestRelation) => ({ ...r })));

  await relationOfTestRelationRepo.save(
    TEST_RELATIONS_OF_RELATION.map((r: RelationOfTestRelationEntity) => ({ ...r })),
  );

  await Promise.all(
    testEntities.map((te) => {
      // eslint-disable-next-line no-param-reassign
      te.oneTestRelation = testRelations.find((tr) => tr.testRelationPk === `test-relations-${te.testEntityPk}-1`);
      if (te.numberType % 2 === 0) {
        // eslint-disable-next-line no-param-reassign
        te.manyTestRelations = testRelations.filter((tr) => tr.relationName.endsWith('two'));
      }
      if (te.numberType % 3 === 0) {
        // eslint-disable-next-line no-param-reassign
        te.manyToManyUniDirectional = testRelations.filter((tr) => tr.relationName.endsWith('three'));
      }
      return testEntityRepo.save(te);
    }),
  );
  await Promise.all(
    testRelations.map(async (te) => {
      const relationOfTestRelationEntity = TEST_RELATIONS_OF_RELATION.find(
        (r) => r.testRelationId === te.testRelationPk,
      );
      te.relationOfTestRelationId = relationOfTestRelationEntity?.id;
      return testRelationRepo.save(te);
    }),
  );

  await testSoftDeleteRepo.save(TEST_SOFT_DELETE_ENTITIES.map((e: TestSoftDeleteEntity) => ({ ...e })));
};
