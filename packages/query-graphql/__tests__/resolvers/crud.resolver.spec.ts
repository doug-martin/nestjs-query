// eslint-disable-next-line max-classes-per-file
import 'reflect-metadata';

import { ID, ObjectType } from '@nestjs/graphql';
import { CRUDResolver, FilterableField } from '../../src';
import * as createResolver from '../../src/resolvers/create.resolver';
import * as readResolver from '../../src/resolvers/read.resolver';
import * as updateResolver from '../../src/resolvers/update.resolver';
import * as deleteResolver from '../../src/resolvers/delete.resolver';

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
    expect(creatableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toBeCalledTimes(1);

    expect(readableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(readableSpy).toBeCalledTimes(1);

    expect(updateableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toBeCalledTimes(1);

    expect(deleteResolverSpy).toBeCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toBeCalledTimes(1);
  });

  it('should pass the provided CreateDTOClass to the CreateResolver', () => {
    CRUDResolver(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO });

    expect(creatableSpy).toBeCalledWith(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO });
    expect(creatableSpy).toBeCalledTimes(1);

    expect(readableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(readableSpy).toBeCalledTimes(1);

    expect(updateableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toBeCalledTimes(1);

    expect(deleteResolverSpy).toBeCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toBeCalledTimes(1);
  });

  it('should mixin the CreateDTOClass to the CreateResolver options', () => {
    CRUDResolver(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO, create: { guards: [] } });

    expect(creatableSpy).toBeCalledWith(TestResolverDTO, { CreateDTOClass: CreateTestResolverDTO, guards: [] });
    expect(creatableSpy).toBeCalledTimes(1);

    expect(readableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(readableSpy).toBeCalledTimes(1);

    expect(updateableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(updateableSpy).toBeCalledTimes(1);

    expect(deleteResolverSpy).toBeCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toBeCalledTimes(1);
  });

  it('should pass the provided UpdateDTOClass to the UpdateResolver', () => {
    CRUDResolver(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO });
    expect(creatableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toBeCalledTimes(1);

    expect(readableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(readableSpy).toBeCalledTimes(1);

    expect(updateableSpy).toBeCalledWith(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO });
    expect(updateableSpy).toBeCalledTimes(1);

    expect(deleteResolverSpy).toBeCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toBeCalledTimes(1);
  });

  it('should mixin the provided UpdateDTOClass to the UpdateResolver options', () => {
    CRUDResolver(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO, update: { guards: [] } });
    expect(creatableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(creatableSpy).toBeCalledTimes(1);

    expect(readableSpy).toBeCalledWith(TestResolverDTO, {});
    expect(readableSpy).toBeCalledTimes(1);

    expect(updateableSpy).toBeCalledWith(TestResolverDTO, { UpdateDTOClass: UpdateTestResolverDTO, guards: [] });
    expect(updateableSpy).toBeCalledTimes(1);

    expect(deleteResolverSpy).toBeCalledWith(TestResolverDTO, {});
    expect(deleteResolverSpy).toBeCalledTimes(1);
  });
});
