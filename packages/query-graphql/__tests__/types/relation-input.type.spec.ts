// eslint-disable-next-line max-classes-per-file
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { InputType, Resolver, Query, Args, Int, ObjectType } from '@nestjs/graphql';
import { FilterableField, IDField, RelationInputType } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('RelationInputType', (): void => {
  @ObjectType()
  class ParentDTO {
    @FilterableField()
    field!: string;
  }

  @ObjectType()
  class ParentCustomIDDTO {
    @IDField(() => String)
    id!: string;
  }

  @ObjectType()
  class RelationDTO {
    @FilterableField()
    relationField!: string;
  }

  @ObjectType()
  class RelationCustomIDDTO {
    @IDField(() => String)
    relationId!: string;
  }

  @InputType()
  class RelationInput extends RelationInputType(ParentDTO, RelationDTO) {}

  it('should create an input type with an id and relationId', async () => {
    @Resolver()
    class RelationInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom id for the parent', async () => {
    @InputType()
    class RelationCustomParentIdInput extends RelationInputType(ParentCustomIDDTO, RelationDTO) {}

    @Resolver()
    class RelationCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationCustomParentIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom id for the relation', async () => {
    @InputType()
    class RelationCustomRelationIdInput extends RelationInputType(ParentDTO, RelationCustomIDDTO) {}

    @Resolver()
    class RelationCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationCustomRelationIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom id for the parent and relation', async () => {
    @InputType()
    class RelationCustomParentAndRelationIdInput extends RelationInputType(ParentCustomIDDTO, RelationCustomIDDTO) {}

    @Resolver()
    class RelationCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationCustomParentAndRelationIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationInputType = { id: 1, relationId: 2 };
    const it = plainToClass(RelationInput, input);
    expect(it.id).toEqual(input.id);
    expect(it.relationId).toEqual(input.relationId);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationId: 1 };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
        },
      ]);
    });

    it('should validate the id is not empty', () => {
      const input = { id: '', relationId: 1 };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'id should not be empty',
          },
          property: 'id',
          target: input,
          value: '',
        },
      ]);
    });

    it('should validate that relationId is defined', () => {
      const input = { id: 1 };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
        },
      ]);
    });

    it('should validate that relationId is not empty', () => {
      const input: RelationInputType = { id: 1, relationId: '' };
      const it = plainToClass(RelationInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'relationId should not be empty',
          },
          property: 'relationId',
          target: input,
          value: input.relationId,
        },
      ]);
    });
  });
});
