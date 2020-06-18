import { ID, ObjectType } from '@nestjs/graphql';
import { CRUDResolver, FilterableField, PagingStrategies } from '../../src';
import * as createResolver from '../../src/resolvers/create.resolver';
import * as deleteResolver from '../../src/resolvers/delete.resolver';
import * as readResolver from '../../src/resolvers/read.resolver';
import * as updateResolver from '../../src/resolvers/update.resolver';

describe('CrudResolver', () => {
  const creatableSpy = jest.spyOn(createResolver, 'Creatable');
  const readableSpy = jest.spyOn(readResolver, 'Readable');
  const updateableSpy = jest.spyOn(updateResolver, 'Updateable');
  const deleteResolverSpy = jest.spyOn(deleteResolver, 'DeleteResolver');

  beforeEach(() => jest.clearAllMocks());

  @ObjectType()
  class TestResolverDTO {
    @FilterableField(() => ID)
    id!: string;

    @FilterableField()
    stringField!: string;

    @FilterableField()
    otherField!: string;
  }

  @ObjectType()
  class CreateTestResolverDTO {
    @FilterableField()
    stringField!: string;
  }

  @ObjectType()
  class UpdateTestResolverDTO {
    @FilterableField()
    stringField!: string;

    @FilterableField()
    otherField!: string;
  }

  it('should create an crud resolver for the DTO class', () => {
    CRUDResolver(TestResolverDTO);
    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });

  it('should pass the provided CreateDTOClass to the CreateResolver', () => {
    CRUDResolver(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO });

    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO });
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });

  it('should mixin the CreateDTOClass to the CreateResolver options', () => {
    CRUDResolver(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO, create: { guards: [] } });

    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO, guards: [] });
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });

  it('should pass the provided UpdateDTOClass to the UpdateResolver', () => {
    CRUDResolver(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO });
    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO });
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });

  it('should mixin the provided UpdateDTOClass to the UpdateResolver options', () => {
    CRUDResolver(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO, update: { guards: [] } });
    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO, guards: [] });
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });

  it('should pass the provided pagingStrategy to the ReadResolver', () => {
    CRUDResolver(TestResolverDTO, { pagingStrategy: PagingStrategies.OFFSET });

    expect(creatableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toHaveBeenCalledTimes(1);

    expect(readableSpy).toHaveBeenCalledWith(TestResolverDTO, { pagingStrategy: PagingStrategies.OFFSET });
    expect(readableSpy).toHaveBeenCalledTimes(1);

    expect(updateableSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toHaveBeenCalledTimes(1);

    expect(deleteResolverSpy).toHaveBeenCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toHaveBeenCalledTimes(1);
  });
});
