import { when, objectContaining, anything, verify, deepEqual, mock, instance } from 'ts-mockito';
import { Filter, UpdateManyResponse } from '@nestjs-query/core';
import { Resolver, Query, Field, InputType } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import {
  MutationArgsType,
  UpdateManyInputType,
  UpdateOneInputType,
  UpdateResolver,
  UpdateResolverOpts,
  InjectPubSub,
} from '../../src';
import { UpdatedEvent } from '../../src/resolvers/update.resolver';
import { EventType, getDTOEventName } from '../../src/subscription';
import {
  generateSchema,
  createResolverFromNest,
  TestResolverDTO,
  TestResolverInputDTO,
  TestService,
} from '../__fixtures__';

describe('UpdateResolver', () => {
  const expectResolverSDL = async (opts?: UpdateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends UpdateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    const schema = await generateSchema([TestSDLResolver]);
    expect(schema).toMatchSnapshot();
  };

  const createTestResolver = (opts?: UpdateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends UpdateResolver(TestResolverDTO, opts) {
      constructor(service: TestService, @InjectPubSub() readonly pubSub: PubSub) {
        super(service);
      }
    }

    return createResolverFromNest(TestResolver);
  };

  it('should create a UpdateResolver for the DTO', () => expectResolverSDL());

  it('should use the dtoName if provided', () => expectResolverSDL({ dtoName: 'Test' }));

  it('should use the one.name option for the updateOne if provided', () =>
    expectResolverSDL({ one: { name: 'update_one_test' } }));

  it('should use the many.name option for the updateMany if provided', () =>
    expectResolverSDL({ many: { name: 'update_many_test' } }));

  it('should use the UpdateDTOClass if provided', () => expectResolverSDL({ UpdateDTOClass: TestResolverInputDTO }));

  it('should not expose update methods if disabled', () => expectResolverSDL({ disabled: true }));

  describe('#updateOne', () => {
    it('should use the provided UpdateOneInput type', () => {
      @InputType()
      class CustomUpdateOneInput extends UpdateOneInputType(TestResolverDTO, TestResolverInputDTO) {
        @Field()
        other!: string;
      }
      return expectResolverSDL({ UpdateOneInput: CustomUpdateOneInput });
    });

    it('should not expose update one method if disabled', () => expectResolverSDL({ one: { disabled: true } }));

    it('should call the service updateOne with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
        id: 'id-1',
        update: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: {} }))).thenResolve(
        output,
      );
      const result = await resolver.updateOne({ input });
      return expect(result).toEqual(output);
    });

    it('should call the service updateOne with the provided input and optional auth filter', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
        id: 'id-1',
        update: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      const authorizeFilter: Filter<TestResolverDTO> = { stringField: { eq: 'foo' } };
      when(
        mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: authorizeFilter })),
      ).thenResolve(output);
      const result = await resolver.updateOne({ input }, authorizeFilter);
      return expect(result).toEqual(output);
    });
  });

  describe('#updateMany', () => {
    it('should not update a new type if the UpdateManyArgs is supplied', () => {
      @InputType()
      class CustomUpdateManyInput extends UpdateManyInputType(TestResolverDTO, TestResolverInputDTO) {
        @Field()
        other!: string;
      }
      return expectResolverSDL({ UpdateManyInput: CustomUpdateManyInput });
    });

    it('should not expose update many method if disabled', () => expectResolverSDL({ many: { disabled: true } }));

    it('should call the service updateMany with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
        input: {
          filter: { id: { eq: 'id-1' } },
          update: {
            stringField: 'foo',
          },
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      when(
        mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
      ).thenResolve(output);
      const result = await resolver.updateMany(input);
      return expect(result).toEqual(output);
    });

    it('should call the service updateMany with the provided input and the auth filter', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
        input: {
          filter: { id: { eq: 'id-1' } },
          update: {
            stringField: 'foo',
          },
        },
      };
      const output: UpdateManyResponse = { updatedCount: 1 };
      const authorizeFilter: Filter<TestResolverDTO> = { stringField: { eq: 'foo' } };
      when(
        mockService.updateMany(
          objectContaining(input.input.update),
          objectContaining({ and: [authorizeFilter, input.input.filter] }),
        ),
      ).thenResolve(output);
      const result = await resolver.updateMany(input, authorizeFilter);
      return expect(result).toEqual(output);
    });
  });

  describe('updated subscription', () => {
    it('should add subscription types if enableSubscriptions is true', () =>
      expectResolverSDL({ enableSubscriptions: true }));

    it('should add subscription types if one.enableSubscriptions is true', () =>
      expectResolverSDL({ one: { enableSubscriptions: true } }));

    it('should add subscription types if many.enableSubscriptions is true', () =>
      expectResolverSDL({ many: { enableSubscriptions: true } }));

    it('should not expose subscriptions if enableSubscriptions is false', () =>
      expectResolverSDL({ enableSubscriptions: false }));

    describe('update one events', () => {
      it('should publish events for create one when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
        });
        const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
          id: 'id-1',
          update: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.UPDATED_ONE, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: {} }))).thenResolve(
          output,
        );
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.updateOne({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should publish events for create one when enableSubscriptions is set to true for createOne', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          one: { enableSubscriptions: true },
        });
        const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
          id: 'id-1',
          update: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.UPDATED_ONE, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: {} }))).thenResolve(
          output,
        );
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.updateOne({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: false,
        });
        const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
          id: 'id-1',
          update: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const context = {};
        when(mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: {} }))).thenResolve(
          output,
        );
        const result = await resolver.updateOne({ input }, context);
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          one: { enableSubscriptions: false },
        });
        const input: UpdateOneInputType<Partial<TestResolverDTO>> = {
          id: 'id-1',
          update: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        when(mockService.updateOne(input.id, objectContaining(input.update), deepEqual({ filter: {} }))).thenResolve(
          output,
        );
        const result = await resolver.updateOne({ input });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('update many events', () => {
      it('should publish events for create one when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
          input: {
            filter: { id: { eq: 'id-1' } },
            update: {
              stringField: 'foo',
            },
          },
        };
        const output: UpdateManyResponse = { updatedCount: 1 };
        const eventName = getDTOEventName(EventType.UPDATED_MANY, TestResolverDTO);
        const event = { [eventName]: output };
        when(
          mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
        ).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.updateMany(input);
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should publish events for create manhy when many.enableSubscriptions is true', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ many: { enableSubscriptions: true } });
        const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
          input: {
            filter: { id: { eq: 'id-1' } },
            update: {
              stringField: 'foo',
            },
          },
        };
        const output: UpdateManyResponse = { updatedCount: 1 };
        const eventName = getDTOEventName(EventType.UPDATED_MANY, TestResolverDTO);
        const event = { [eventName]: output };
        when(
          mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
        ).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.updateMany(input);
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: false });
        const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
          input: {
            filter: { id: { eq: 'id-1' } },
            update: {
              stringField: 'foo',
            },
          },
        };
        const output: UpdateManyResponse = { updatedCount: 1 };
        when(
          mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
        ).thenResolve(output);
        const result = await resolver.updateMany(input);
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          many: { enableSubscriptions: false },
        });
        const input: MutationArgsType<UpdateManyInputType<TestResolverDTO, Partial<TestResolverDTO>>> = {
          input: {
            filter: { id: { eq: 'id-1' } },
            update: {
              stringField: 'foo',
            },
          },
        };
        const output: UpdateManyResponse = { updatedCount: 1 };
        when(
          mockService.updateMany(objectContaining(input.input.update), objectContaining(input.input.filter)),
        ).thenResolve(output);
        const result = await resolver.updateMany(input);
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('updatedOneSubscription', () => {
      it('should propagate events if enableSubscriptions is true', async () => {
        const { resolver, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
        });
        const eventName = getDTOEventName(EventType.UPDATED_ONE, TestResolverDTO);

        const event: UpdatedEvent<TestResolverDTO> = {
          [eventName]: {
            id: 'id-1',
            stringField: 'foo',
          },
        };
        const mockIterator = mock<AsyncIterator<UpdatedEvent<TestResolverDTO>>>();
        when(mockPubSub.asyncIterator(eventName)).thenReturn(instance(mockIterator));
        when(mockIterator.next()).thenResolve({ done: false, value: event });
        const result = await resolver.updatedOneSubscription().next();
        verify(mockPubSub.asyncIterator(eventName)).once();
        return expect(result).toEqual({
          done: false,
          value: event,
        });
      });

      it('should not propagate events if enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: false,
        });
        const eventName = getDTOEventName(EventType.UPDATED_ONE, TestResolverDTO);
        return expect(() => resolver.updatedOneSubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });

      it('should not propagate events if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: true,
          one: { enableSubscriptions: false },
        });
        const eventName = getDTOEventName(EventType.UPDATED_ONE, TestResolverDTO);
        return expect(() => resolver.updatedOneSubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });
    });

    describe('updatedManySubscription', () => {
      it('should propagate events if enableSubscriptions is true', async () => {
        const { resolver, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const eventName = getDTOEventName(EventType.UPDATED_MANY, TestResolverDTO);
        const event: UpdateManyResponse = { updatedCount: 1 };
        const mockIterator = mock<AsyncIterator<UpdateManyResponse>>();
        when(mockPubSub.asyncIterator(eventName)).thenReturn(instance(mockIterator));
        when(mockIterator.next()).thenResolve({ done: false, value: event });
        const result = await resolver.updatedManySubscription().next();
        verify(mockPubSub.asyncIterator(eventName)).once();
        return expect(result).toEqual({
          done: false,
          value: event,
        });
      });

      it('should not propagate events if enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: false,
        });
        const eventName = getDTOEventName(EventType.UPDATED_MANY, TestResolverDTO);
        return expect(() => resolver.updatedManySubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });

      it('should not propagate events if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: true,
          many: { enableSubscriptions: false },
        });
        const eventName = getDTOEventName(EventType.UPDATED_MANY, TestResolverDTO);
        return expect(() => resolver.updatedManySubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });
    });
  });
});
