// eslint-disable-next-line max-classes-per-file
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { Args, Query, Resolver, Int, InputType, ObjectType } from '@nestjs/graphql';
import { FilterableField, IDField, RelationsInputType } from '../../src';
import { generateSchema } from '../__fixtures__';

describe('RelationsInputType', (): void => {
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
  class RelationsInput extends RelationsInputType(ParentDTO, RelationDTO) {}

  it('should create an input type with an id and relationIds fields', async () => {
    @Resolver()
    class RelationsInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationsInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationsInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom parent id', async () => {
    @InputType()
    class RelationsCustomParentIdInput extends RelationsInputType(ParentCustomIDDTO, RelationDTO) {}

    @Resolver()
    class RelationsCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationsCustomParentIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationsCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom relation id', async () => {
    @InputType()
    class RelationsCustomRelationIdInput extends RelationsInputType(ParentDTO, RelationCustomIDDTO) {}

    @Resolver()
    class RelationsCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationsCustomRelationIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationsCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should create an input type with a custom parent and relation id', async () => {
    @InputType()
    class RelationsCustomParentRelationIdInput extends RelationsInputType(ParentCustomIDDTO, RelationCustomIDDTO) {}

    @Resolver()
    class RelationsCustomIdInputTypeSpec {
      @Query(() => Int)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      test(@Args('input') input: RelationsCustomParentRelationIdInput): number {
        return 1;
      }
    }
    const schema = await generateSchema([RelationsCustomIdInputTypeSpec]);
    expect(schema).toMatchSnapshot();
  });

  it('should return the input when accessing the update field', () => {
    const input: RelationsInputType = { id: 1, relationIds: [2, 3, 4] };
    const it = plainToClass(RelationsInput, input);
    expect(it.id).toEqual(input.id);
    expect(it.relationIds).toEqual(input.relationIds);
  });

  describe('validation', () => {
    it('should validate the id is defined', () => {
      const input = { relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsInput, input);
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
      const input = { id: '', relationIds: [2, 3, 4] };
      const it = plainToClass(RelationsInput, input);
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

    it('should allow an empty relationIds array', () => {
      const input: RelationsInputType = { id: 1, relationIds: [] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([]);
    });

    it('should validate that relationsIds is unique', () => {
      const input: RelationsInputType = { id: 1, relationIds: [1, 2, 1, 2] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            arrayUnique: "All relationIds's elements must be unique",
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });

    it('should validate that relationsIds does not contain an empty id', () => {
      const input: RelationsInputType = { id: 1, relationIds: [''] };
      const it = plainToClass(RelationsInput, input);
      const errors = validateSync(it);
      expect(errors).toEqual([
        {
          children: [],
          constraints: {
            isNotEmpty: 'each value in relationIds should not be empty',
          },
          property: 'relationIds',
          target: input,
          value: input.relationIds,
        },
      ]);
    });
  });
});
