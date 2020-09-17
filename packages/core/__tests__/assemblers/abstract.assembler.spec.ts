import {
  transformQuery,
  Query,
  AbstractAssembler,
  Assembler,
  AggregateQuery,
  AggregateResponse,
  transformAggregateQuery,
  transformAggregateResponse,
  DeepPartial,
} from '../../src';

describe('ClassTransformerAssembler', () => {
  class TestDTO {
    firstName!: string;

    lastName!: string;
  }

  class TestEntity {
    first!: string;

    last!: string;
  }

  @Assembler(TestDTO, TestEntity)
  class TestAssembler extends AbstractAssembler<TestDTO, TestEntity> {
    convertToCreateEntity(create: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return {
        first: create.firstName,
        last: create.lastName,
      };
    }

    convertToUpdateEntity(update: DeepPartial<TestDTO>): DeepPartial<TestEntity> {
      return {
        first: update.firstName,
        last: update.lastName,
      };
    }

    convertToDTO(entity: TestEntity): TestDTO {
      return {
        firstName: entity.first,
        lastName: entity.last,
      };
    }

    convertToEntity(dto: TestDTO): TestEntity {
      return {
        first: dto.firstName,
        last: dto.lastName,
      };
    }

    convertQuery(query: Query<TestDTO>): Query<TestEntity> {
      return transformQuery(query, {
        firstName: 'first',
        lastName: 'last',
      });
    }

    convertAggregateQuery(aggregate: AggregateQuery<TestDTO>): AggregateQuery<TestEntity> {
      return transformAggregateQuery(aggregate, {
        firstName: 'first',
        lastName: 'last',
      });
    }

    convertAggregateResponse(aggregate: AggregateResponse<TestEntity>): AggregateResponse<TestDTO> {
      return transformAggregateResponse(aggregate, {
        first: 'firstName',
        last: 'lastName',
      });
    }
  }

  const testDTO: TestDTO = { firstName: 'foo', lastName: 'bar' };
  const testEntity: TestEntity = { first: 'foo', last: 'bar' };

  it('should throw an error if DTOClass or EntityClass cannot be determined', () => {
    class TestBadAssembler extends TestAssembler {}
    expect(() => new TestBadAssembler()).toThrow(
      'Unable to determine DTO or Entity types for TestBadAssembler. Did you annotate your assembler with @Assembler',
    );
    expect(() => new TestBadAssembler(TestDTO)).toThrow(
      'Unable to determine DTO or Entity types for TestBadAssembler. Did you annotate your assembler with @Assembler',
    );
    expect(() => new TestBadAssembler(undefined, TestEntity)).toThrow(
      'Unable to determine DTO or Entity types for TestBadAssembler. Did you annotate your assembler with @Assembler',
    );
  });

  describe('convertToDTOs', () => {
    it('should call the convertToDTO implementation', () => {
      const assembler = new TestAssembler();
      expect(assembler.convertToDTOs([testEntity])).toEqual([testDTO]);
    });
  });

  describe('convertAsyncToDTO', () => {
    it('should call the convertToDTO implementation with the resolved value', () => {
      const assembler = new TestAssembler();
      return expect(assembler.convertAsyncToDTO(Promise.resolve(testEntity))).resolves.toEqual(testDTO);
    });
  });

  describe('convertAsyncToDTOs', () => {
    it('should call the convertToDTO implementation with the resolved value', () => {
      const assembler = new TestAssembler();
      return expect(assembler.convertAsyncToDTOs(Promise.resolve([testEntity]))).resolves.toEqual([testDTO]);
    });
  });

  describe('convertToEntities', () => {
    it('should call the convertToEntity implementation', () => {
      const assembler = new TestAssembler();
      expect(assembler.convertToEntities([testDTO])).toEqual([testEntity]);
    });
  });

  describe('convertAsyncToEntity', () => {
    it('should call the convertToEntity implementation with the resolved value', () => {
      const assembler = new TestAssembler();
      return expect(assembler.convertAsyncToEntity(Promise.resolve(testDTO))).resolves.toEqual(testEntity);
    });
  });

  describe('convertAsyncToEntities', () => {
    it('should call the convertToEntity implementation with the resolved value', () => {
      const assembler = new TestAssembler();
      return expect(assembler.convertAsyncToEntities(Promise.resolve([testDTO]))).resolves.toEqual([testEntity]);
    });
  });
});
