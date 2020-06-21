import { QueryService } from '@nestjs-query/core';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import { CountRelationsLoader } from '../../src/loader';

describe('CountRelationsLoader', () => {
  describe('createLoader', () => {
    class DTO {
      id!: string;
    }

    class RelationDTO {
      id!: string;
    }

    it('should return a function that accepts a filter', () => {
      const service = mock<QueryService<DTO>>();
      const countRelationsLoader = new CountRelationsLoader(RelationDTO, 'relation');
      expect(countRelationsLoader.createLoader(instance(service))).toBeInstanceOf(Function);
    });

    it('should try to load the relations with the filter', () => {
      const service = mock<QueryService<DTO>>();
      const countRelationsLoader = new CountRelationsLoader(RelationDTO, 'relation').createLoader(instance(service));
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }];
      when(service.countRelations(RelationDTO, 'relation', deepEqual(dtos), deepEqual({}))).thenResolve(
        new Map([
          [dtos[0], 1],
          [dtos[1], 2],
        ]),
      );
      return expect(
        countRelationsLoader([
          { dto: dtos[0], filter: {} },
          { dto: dtos[1], filter: {} },
        ]),
      ).resolves.toEqual([1, 2]);
    });

    it('should try return an empty array for each dto is no results are found', () => {
      const service = mock<QueryService<DTO>>();
      const countRelationsLoader = new CountRelationsLoader(RelationDTO, 'relation').createLoader(instance(service));
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }];
      when(service.countRelations(RelationDTO, 'relation', deepEqual(dtos), deepEqual({}))).thenResolve(
        new Map([[dtos[0], 1]]),
      );
      return expect(
        countRelationsLoader([
          { dto: dtos[0], filter: {} },
          { dto: dtos[1], filter: {} },
        ]),
      ).resolves.toEqual([1, 0]);
    });

    it('should group queryRelations calls by query and return in the correct order', () => {
      const service = mock<QueryService<DTO>>();
      const countRelationsLoader = new CountRelationsLoader(RelationDTO, 'relation').createLoader(instance(service));
      const dtos: DTO[] = [{ id: 'dto-1' }, { id: 'dto-2' }, { id: 'dto-3' }, { id: 'dto-4' }];
      when(
        service.countRelations(
          RelationDTO,
          'relation',
          deepEqual([dtos[0], dtos[2]]),
          deepEqual({ id: { isNot: null } }),
        ),
      ).thenResolve(
        new Map([
          [dtos[0], 1],
          [dtos[2], 2],
        ]),
      );
      when(service.countRelations(RelationDTO, 'relation', deepEqual([dtos[1], dtos[3]]), deepEqual({}))).thenResolve(
        new Map([
          [dtos[1], 3],
          [dtos[3], 4],
        ]),
      );
      return expect(
        countRelationsLoader([
          { dto: dtos[0], filter: { id: { isNot: null } } },
          { dto: dtos[1], filter: {} },
          { dto: dtos[2], filter: { id: { isNot: null } } },
          { dto: dtos[3], filter: {} },
        ]),
      ).resolves.toEqual([1, 3, 2, 4]);
    });
  });
});
