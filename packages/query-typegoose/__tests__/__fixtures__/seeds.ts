import { Connection } from 'mongoose';
import { plainToClass } from 'class-transformer';
import { TestEntity } from './test.entity';
import { TestReference } from './test-reference.entity';

export const TEST_ENTITIES: TestEntity[] = new Array(15)
  .fill(0)
  .map((e, i) => i + 1)
  .map((i) => {
    return plainToClass(TestEntity, {
      boolType: i % 2 === 0,
      dateType: new Date(`2020-02-${i}`),
      numberType: i,
      stringType: `foo${i}`,
    });
  });

export const TEST_REFERENCES: TestReference[] = [1, 2, 3, 4, 5].map((i) => {
  return plainToClass(TestReference, {
    name: `name${i}`,
  });
});

export const seed = async (connection: Connection): Promise<void> => {
  await connection.collection('testentities').insertMany(TEST_ENTITIES);
  await connection.collection('testreferences').insertMany(TEST_REFERENCES);

  await Promise.all(
    TEST_REFERENCES.map((testReference, i) => {
      return connection
        .collection('testentities')
        .updateOne({ stringType: TEST_ENTITIES[i + 10].stringType }, { $set: { testReference: testReference.id } });
    }),
  );
};
