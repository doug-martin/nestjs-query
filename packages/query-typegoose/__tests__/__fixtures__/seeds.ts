/* eslint-disable no-underscore-dangle,@typescript-eslint/no-unsafe-return */
import { getModelForClass, DocumentType, getDiscriminatorModelForClass, mongoose } from '@typegoose/typegoose';
import { TestEntity } from './test.entity';
import { TestDiscriminatedEntity } from './test-discriminated.entity';
import { TestReference } from './test-reference.entity';

export const TEST_ENTITIES: DocumentType<TestEntity>[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
  (i) =>
    ({
      boolType: i % 2 === 0,
      dateType: new Date(`2020-02-${i} 12:00`),
      numberType: i,
      stringType: `foo${i}`
    } as DocumentType<TestEntity>)
);

export const TEST_DISCRIMINATED_ENTITIES: DocumentType<TestDiscriminatedEntity>[] = [
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20
].map(
  (i) =>
    ({
      boolType: i % 2 === 0,
      dateType: new Date(`2020-02-${i} 12:00`),
      numberType: i,
      stringType: `foo${i}`,
      stringType2: `bar${i}`
    } as DocumentType<TestDiscriminatedEntity>)
);

export const TEST_REFERENCES: DocumentType<TestReference>[] = TEST_ENTITIES.reduce(
  (relations, te) => [
    ...relations,
    {
      referenceName: `${te.stringType}-test-reference-1-one`
    } as DocumentType<TestReference>,
    {
      referenceName: `${te.stringType}-test-reference-2-two`
    } as DocumentType<TestReference>,
    {
      referenceName: `${te.stringType}-test-reference-3-three`
    } as DocumentType<TestReference>
  ],
  [] as DocumentType<TestReference>[]
);

export const TEST_REFERENCES_FOR_DISCRIMINATES: DocumentType<TestReference>[] = TEST_DISCRIMINATED_ENTITIES.reduce(
  (relations, tde) => [
    ...relations,
    {
      referenceName: `${tde.stringType}-test-reference-1-one`
    } as DocumentType<TestReference>,
    {
      referenceName: `${tde.stringType}-test-reference-2-two`
    } as DocumentType<TestReference>,
    {
      referenceName: `${tde.stringType}-test-reference-3-three`
    } as DocumentType<TestReference>
  ],
  [] as DocumentType<TestReference>[]
);

export const seed = async (connection: mongoose.Connection): Promise<void> => {
  const TestEntityModel = getModelForClass(TestEntity, { existingConnection: connection });
  const TestReferencesModel = getModelForClass(TestReference, { existingConnection: connection });
  const TestDiscriminatedModel = getDiscriminatorModelForClass(TestEntityModel, TestDiscriminatedEntity);

  const testEntities = await TestEntityModel.create(TEST_ENTITIES);
  const testDiscriminatedEntities = await TestDiscriminatedModel.create(TEST_DISCRIMINATED_ENTITIES);
  const testReferences = await TestReferencesModel.create(TEST_REFERENCES);
  const testReferencesForDiscriminates = await TestReferencesModel.create(TEST_REFERENCES_FOR_DISCRIMINATES);

  testEntities.forEach((te, index) => Object.assign(TEST_ENTITIES[index], te.toObject({ virtuals: true })));

  testDiscriminatedEntities.forEach((tde, index) =>
    Object.assign(TEST_DISCRIMINATED_ENTITIES[index], tde.toObject({ virtuals: true }))
  );

  testReferences.forEach((tr, index) => Object.assign(TEST_REFERENCES[index], tr.toObject({ virtuals: true })));

  testReferencesForDiscriminates.forEach((trfd, index) =>
    Object.assign(TEST_REFERENCES_FOR_DISCRIMINATES[index], trfd.toObject({ virtuals: true }))
  );

  await Promise.all(
    testEntities.map(async (te, index) => {
      const references = testReferences.filter((tr: TestReference) => tr.referenceName.includes(`${te.stringType}-`));
      TEST_ENTITIES[index].testReference = references[0]._id;
      TEST_ENTITIES[index].testReferences = references.map((r) => r._id);
      await te.updateOne({ $set: { testReferences: references.map((r) => r._id), testReference: references[0]._id } });
      await Promise.all(
        references.map((r) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          TEST_REFERENCES.find((tr) => tr._id.toString() === r._id.toString())!.testEntity = te._id;
          return r.updateOne({ $set: { testEntity: te._id } });
        })
      );
    })
  );

  await Promise.all(
    testDiscriminatedEntities.map(async (tde, index) => {
      const references = testReferencesForDiscriminates.filter((trfd: TestReference) =>
        trfd.referenceName.includes(`${tde.stringType}-`)
      );
      TEST_DISCRIMINATED_ENTITIES[index].testReference = references[0]._id;
      TEST_DISCRIMINATED_ENTITIES[index].testReferences = references.map((r) => r._id);
      await tde.updateOne({ $set: { testReferences: references.map((r) => r._id), testReference: references[0]._id } });
      await Promise.all(
        references.map((r) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          TEST_REFERENCES_FOR_DISCRIMINATES.find((tr) => tr._id.toString() === r._id.toString())!.testEntity = tde._id;
          return r.updateOne({ $set: { testEntity: tde._id } });
        })
      );
    })
  );
};
