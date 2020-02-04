import 'reflect-metadata';
import { Float, ObjectType } from 'type-graphql';
import { FilterableField } from '../../src';
import { getMetadataStorage } from '../../src/metadata';

describe('FilterableField decorator', (): void => {
  beforeEach(() => getMetadataStorage().clear());
  afterEach(() => getMetadataStorage().clear());

  it('should store metadata', () => {
    const floatReturnFunc = () => Float;
    @ObjectType('test')
    class TestDto {
      @FilterableField()
      stringField!: string;

      @FilterableField({ nullable: true })
      stringOptionalField?: string;

      @FilterableField(floatReturnFunc, { nullable: true })
      floatField?: number;

      @FilterableField(undefined, { nullable: true })
      numberField?: number;
    }
    const fields = getMetadataStorage().getFilterableObjectFields(TestDto);
    expect(fields).toMatchObject([
      { propertyName: 'stringField', target: String, advancedOptions: undefined, returnTypeFunc: undefined },
      {
        propertyName: 'stringOptionalField',
        target: String,
        advancedOptions: { nullable: true },
        returnTypeFunc: undefined,
      },
      {
        propertyName: 'floatField',
        target: Number,
        advancedOptions: { nullable: true },
        returnTypeFunc: floatReturnFunc,
      },
      { propertyName: 'numberField', target: Number, advancedOptions: { nullable: true }, returnTypeFunc: undefined },
    ]);
  });
});
