import { AggregateQuery, QueryService } from '@nestjs-query/core';
import { mock, instance, when, deepEqual } from 'ts-mockito';
import { AggregateRelationsLoader } from '../../src/loader';

describe('AggregateRelationsLoader', () => {
  describe('createLoader', () => {
    class DTO {
      id!: string;
    }

    class RelationDTO {
      id!: string;
    }

    it('should return a function that accepts aggregate args', () => {
      const service = mock<QueryService<DTO>>();
      const queryRelationsLoader = new AggregateRelationsLoader(RelationDTO, 'relation');
      expect(queryRelationsLoader.createLoader(instance(service))).toBeInstanceOf(Function);
    });

    it('should try to load the relations with the query args', () => {
      const service = mock<QueryService<DTO>>();
      const aggregateRelationsLoader = new AggregateRelationsLoader(RelationDTO, 'relation').createLoader(
        instance(service),
      );
      const filter = {};
      const aggregate: AggregateQuery<RelationDTO> = { count: ['id'] };
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }];
      const dto1Aggregate = [{ count: { id: 2 } }];
      const dto2Aggregate = [{ count: { id: 3 } }];
      when(
        service.aggregateRelations(RelationDTO, 'relation', deepEqual(dtos), deepEqual(filter), deepEqual(aggregate)),
      ).thenResolve(
        new Map([
          [dtos[0], dto1Aggregate],
          [dtos[1], dto2Aggregate],
        ]),
      );
      return expect(
        aggregateRelationsLoader([
          { dto: dtos[0], filter, aggregate },
          { dto: dtos[1], filter, aggregate },
        ]),
      ).resolves.toEqual([dto1Aggregate, dto2Aggregate]);
    });

    it('should try return an empty aggregate result for each dto if no results are found', () => {
      const service = mock<QueryService<DTO>>();
      const aggregateRelationsLoader = new AggregateRelationsLoader(RelationDTO, 'relation').createLoader(
        instance(service),
      );
      const filter = {};
      const aggregate: AggregateQuery<RelationDTO> = { count: ['id'] };
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }];
      const dto1Aggregate = [{ count: { id: 2 } }];
      when(
        service.aggregateRelations(RelationDTO, 'relation', deepEqual(dtos), deepEqual(filter), deepEqual(aggregate)),
      ).thenResolve(new Map([[dtos[0], dto1Aggregate]]));
      return expect(
        aggregateRelationsLoader([
          { dto: dtos[0], filter, aggregate },
          { dto: dtos[1], filter, aggregate },
        ]),
      ).resolves.toEqual([dto1Aggregate, {}]);
    });

    it('should group queryRelations calls by filter and return in the correct order', () => {
      const service = mock<QueryService<DTO>>();
      const queryRelationsLoader = new AggregateRelationsLoader(RelationDTO, 'relation').createLoader(
        instance(service),
      );
      const filter1 = { id: { gt: 'a' } };
      const filter2 = {};
      const aggregate: AggregateQuery<RelationDTO> = { count: ['id'] };
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }, { id: 'dto-3' }, { id: 'dto-4' }];
      const dto1Aggregate = [{ count: { id: 2 } }];
      const dto2Aggregate = [{ count: { id: 3 } }];
      const dto3Aggregate = [{ count: { id: 4 } }];
      const dto4Aggregate = [{ count: { id: 5 } }];
      when(
        service.aggregateRelations(
          RelationDTO,
          'relation',
          deepEqual([dtos[0], dtos[2]]),
          deepEqual(filter1),
          deepEqual(aggregate),
        ),
      ).thenResolve(
        new Map([
          [dtos[0], dto1Aggregate],
          [dtos[2], dto3Aggregate],
        ]),
      );
      when(
        service.aggregateRelations(
          RelationDTO,
          'relation',
          deepEqual([dtos[1], dtos[3]]),
          deepEqual(filter2),
          deepEqual(aggregate),
        ),
      ).thenResolve(
        new Map([
          [dtos[1], dto2Aggregate],
          [dtos[3], dto4Aggregate],
        ]),
      );
      return expect(
        queryRelationsLoader([
          { dto: dtos[0], filter: filter1, aggregate },
          { dto: dtos[1], filter: filter2, aggregate },
          { dto: dtos[2], filter: filter1, aggregate },
          { dto: dtos[3], filter: filter2, aggregate },
        ]),
      ).resolves.toEqual([dto1Aggregate, dto2Aggregate, dto3Aggregate, dto4Aggregate]);
    });

    it('should group queryRelations calls by aggregate and return in the correct order', () => {
      const service = mock<QueryService<DTO>>();
      const queryRelationsLoader = new AggregateRelationsLoader(RelationDTO, 'relation').createLoader(
        instance(service),
      );
      const filter = {};
      const aggregate1: AggregateQuery<RelationDTO> = { count: ['id'] };
      const aggregate2: AggregateQuery<RelationDTO> = { sum: ['id'] };
      const dtos = [{ id: 'dto-1' }, { id: 'dto-2' }, { id: 'dto-3' }, { id: 'dto-4' }];
      const dto1Aggregate = [{ count: { id: 2 } }];
      const dto2Aggregate = [{ sum: { id: 3 } }];
      const dto3Aggregate = [{ count: { id: 4 } }];
      const dto4Aggregate = [{ sum: { id: 5 } }];
      when(
        service.aggregateRelations(
          RelationDTO,
          'relation',
          deepEqual([dtos[0], dtos[2]]),
          deepEqual(filter),
          deepEqual(aggregate1),
        ),
      ).thenResolve(
        new Map([
          [dtos[0], dto1Aggregate],
          [dtos[2], dto3Aggregate],
        ]),
      );
      when(
        service.aggregateRelations(
          RelationDTO,
          'relation',
          deepEqual([dtos[1], dtos[3]]),
          deepEqual(filter),
          deepEqual(aggregate2),
        ),
      ).thenResolve(
        new Map([
          [dtos[1], dto2Aggregate],
          [dtos[3], dto4Aggregate],
        ]),
      );
      return expect(
        queryRelationsLoader([
          { dto: dtos[0], filter, aggregate: aggregate1 },
          { dto: dtos[1], filter, aggregate: aggregate2 },
          { dto: dtos[2], filter, aggregate: aggregate1 },
          { dto: dtos[3], filter, aggregate: aggregate2 },
        ]),
      ).resolves.toEqual([dto1Aggregate, dto2Aggregate, dto3Aggregate, dto4Aggregate]);
    });
  });
});
