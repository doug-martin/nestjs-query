import { Column, Entity, PrimaryColumn } from 'typeorm';
import { getQueryTypeormMetadata, QueryTypeormEntityMetadata } from '../../src/common';
import { closeTestConnection, createTestConnection, getTestConnection } from '../__fixtures__/connection.fixture';
import { TestEntityRelationEntity } from '../__fixtures__/test-entity-relation.entity';
import { TestRelation } from '../__fixtures__/test-relation.entity';
import { TestEntity } from '../__fixtures__/test.entity';

describe('TypeormMetadata', (): void => {
  class TestEmbedded {
    @Column({ type: 'text' })
    stringType!: string;

    @Column({ type: 'boolean' })
    boolType!: boolean;
  }

  @Entity()
  class TestMetadataEntity {
    @PrimaryColumn({ type: 'text' })
    pk!: string;

    @Column({ type: 'text' })
    stringType!: string;

    @Column({ type: 'boolean' })
    boolType!: boolean;

    @Column({ type: 'integer' })
    numberType!: number;

    @Column({ type: 'date' })
    dateType!: Date;

    @Column({ type: 'datetime' })
    datetimeType!: Date;

    @Column({ type: 'simple-json' })
    jsonType!: any;

    @Column(() => TestEmbedded)
    embeddedType!: TestEmbedded;
  }

  beforeEach(() => createTestConnection({ extraEntities: [TestMetadataEntity] }));
  afterEach(() => closeTestConnection());

  it('Test metadata', (): void => {
    const meta = getQueryTypeormMetadata(getTestConnection());
    // Implicit column types
    expect(meta.get(TestEntity)).toMatchObject({
      testEntityPk: { metaType: 'property', type: String },
      stringType: { metaType: 'property', type: String },
      dateType: { metaType: 'property', type: Date },
      boolType: { metaType: 'property', type: Boolean },
      oneTestRelation: { metaType: 'relation', type: TestRelation },
      testRelations: { metaType: 'relation', type: TestRelation },
      manyTestRelations: { metaType: 'relation', type: TestRelation },
      manyToManyUniDirectional: { metaType: 'relation', type: TestRelation },
      testEntityRelation: { metaType: 'relation', type: TestEntityRelationEntity },
    } as QueryTypeormEntityMetadata<TestEntity>);
    // Explicit column types
    expect(meta.get(TestMetadataEntity)).toMatchObject({
      pk: { metaType: 'property', type: 'text' },
      stringType: { metaType: 'property', type: 'text' },
      boolType: { metaType: 'property', type: 'boolean' },
      numberType: { metaType: 'property', type: 'integer' },
      dateType: { metaType: 'property', type: 'date' },
      datetimeType: { metaType: 'property', type: 'datetime' },
      jsonType: { metaType: 'property', type: 'simple-json' },
    } as QueryTypeormEntityMetadata<TestMetadataEntity>);
  });
});
