/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-return */
import { Connection } from 'mongoose';
import { TestEntity } from './test.entity';
import { TestReference } from './test-reference.entity';

export const TEST_ENTITIES: TestEntity[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
  return {
    boolType: i % 2 === 0,
    dateType: new Date(`2020-02-${i}`),
    numberType: i,
    stringType: `foo${i}`,
  } as TestEntity;
});

export const TEST_REFERENCES: TestReference[] = TEST_ENTITIES.reduce((relations, te) => {
  return [
    ...relations,
    {
      referenceName: `${te.stringType}-test-reference-1-one`,
    } as TestReference,
    {
      referenceName: `${te.stringType}-test-reference-2-two`,
    } as TestReference,
    {
      referenceName: `${te.stringType}-test-reference-3-three`,
    } as TestReference,
  ];
}, [] as TestReference[]);

export const seed = async (connection: Connection): Promise<void> => {
  const TestEntityModel = connection.model<TestEntity>('TestEntity');
  const TestReferencesModel = connection.model<TestReference>('TestReference');

  const testEntities = await TestEntityModel.create(TEST_ENTITIES);
  const testReferences = await TestReferencesModel.create(TEST_REFERENCES);
  testEntities.forEach((te, index) => Object.assign(TEST_ENTITIES[index], te.toObject({ virtuals: true })));
  testReferences.forEach((tr, index) => Object.assign(TEST_REFERENCES[index], tr.toObject({ virtuals: true })));
  await Promise.all(
    testEntities.map(async (te, index) => {
      const references = testReferences.filter((tr) => tr.referenceName.includes(`${te.stringType}-`));
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      TEST_ENTITIES[index].testReference = references[0]._id;
      TEST_ENTITIES[index].testReferences = references.map((r) => r._id);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      await te.update({ $set: { testReferences: references.map((r) => r._id), testReference: references[0]._id } });
      await Promise.all(
        references.map((r) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
          TEST_REFERENCES.find((tr) => tr._id.toString() === r._id.toString())!.testEntity = te._id;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          return r.update({ $set: { testEntity: te._id } });
        }),
      );
    }),
  );
};
