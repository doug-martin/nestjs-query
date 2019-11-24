import 'reflect-metadata';
import { Float, ObjectType } from 'type-graphql';
import { FilterableField } from './filterable-field.decorator';
import { getMetadataStorage } from '../metadata';

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
      { propertyName: 'stringField', type: String, advancedOptions: undefined, returnTypeFunc: undefined },
      {
        propertyName: 'stringOptionalField',
        type: String,
        advancedOptions: { nullable: true },
        returnTypeFunc: undefined,
      },
      {
        propertyName: 'floatField',
        type: Number,
        advancedOptions: { nullable: true },
        returnTypeFunc: floatReturnFunc,
      },
      { propertyName: 'numberField', type: Number, advancedOptions: { nullable: true }, returnTypeFunc: undefined },
    ]);
  });
});
