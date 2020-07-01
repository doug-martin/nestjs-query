import { DeleteManyResponse } from '@nestjs-query/core';
import { Field, InputType, Query, Resolver } from '@nestjs/graphql';
import { deepEqual, objectContaining, when, verify, anything, mock, instance } from 'ts-mockito';
import { PubSub } from 'graphql-subscriptions';
import { DeleteManyInputType, DeleteOneInputType, DeleteResolver, DeleteResolverOpts, InjectPubSub } from '../../src';
import { DeletedEvent } from '../../src/resolvers/delete.resolver';
import { EventType, getDTOEventName } from '../../src/subscription';
import { expectSDL } from '../__fixtures__';
import {
  createResolverFromNest,
  deleteBasicResolverSDL,
  deleteCustomManyInputResolverSDL,
  deleteCustomNameResolverSDL,
  deleteCustomOneInputResolverSDL,
  deleteDisabledResolverSDL,
  deleteManyDisabledResolverSDL,
  deleteManySubscriptionResolverSDL,
  deleteOneDisabledResolverSDL,
  deleteOneSubscriptionResolverSDL,
  deleteSubscriptionResolverSDL,
  TestService,
} from './__fixtures__';
import { TestResolverDTO } from './__fixtures__/test-resolver.dto';

describe('DeleteResolver', () => {
  const expectResolverSDL = (sdl: string, opts?: DeleteResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends DeleteResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }
    return expectSDL([TestSDLResolver], sdl);
  };

  const createTestResolver = (opts?: DeleteResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends DeleteResolver(TestResolverDTO, opts) {
      constructor(service: TestService, @InjectPubSub() readonly pubSub: PubSub) {
        super(service);
      }
    }

    return createResolverFromNest(TestResolver);
  };

  it('should create a DeleteResolver for the DTO', () => {
    return expectResolverSDL(deleteBasicResolverSDL);
  });

  it('should use the dtoName if provided', () => {
    return expectResolverSDL(deleteCustomNameResolverSDL, { dtoName: 'Test' });
  });

  it('should not expose delete methods if disabled', () => {
    return expectResolverSDL(deleteDisabledResolverSDL, { disabled: true });
  });

  describe('#deleteOne', () => {
    it('should use the provided DeleteOneInput type', () => {
      @InputType()
      class CustomDeleteOneInput {
        @Field()
        id!: string;

        @Field()
        foo!: string;
      }
      return expectResolverSDL(deleteCustomOneInputResolverSDL, {
        DeleteOneInput: CustomDeleteOneInput,
      });
    });

    it('should not expose delete one method if disabled', () => {
      return expectResolverSDL(deleteOneDisabledResolverSDL, { one: { disabled: true } });
    });

    it('should call the service deleteOne with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: DeleteOneInputType = {
        id: 'id-1',
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.deleteOne(input.id)).thenResolve(output);
      const result = await resolver.deleteOne({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('#deleteMany', () => {
    it('should not create a new delete type if the DeleteManyArgs is supplied', () => {
      @InputType()
      class CustomDeleteManyInput extends DeleteManyInputType(TestResolverDTO) {
        @Field()
        foo!: string;
      }
      return expectResolverSDL(deleteCustomManyInputResolverSDL, {
        DeleteManyInput: CustomDeleteManyInput,
      });
    });

    it('should not expose delete many method if disabled', () => {
      return expectResolverSDL(deleteManyDisabledResolverSDL, { many: { disabled: true } });
    });

    it('should call the service deleteMany with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const input: DeleteManyInputType<TestResolverDTO> = {
        filter: { id: { eq: 'id-1' } },
      };
      const output: DeleteManyResponse = { deletedCount: 1 };
      when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
      const result = await resolver.deleteMany({ input });
      return expect(result).toEqual(output);
    });
  });

  describe('deleted subscription', () => {
    it('should add subscription types if enableSubscriptions is true', () => {
      return expectResolverSDL(deleteSubscriptionResolverSDL, {
        enableSubscriptions: true,
      });
    });

    it('should add subscription types if one.enableSubscriptions is true', () => {
      return expectResolverSDL(deleteOneSubscriptionResolverSDL, {
        one: {
          enableSubscriptions: true,
        },
      });
    });

    it('should add subscription types if many.enableSubscriptions is true', () => {
      return expectResolverSDL(deleteManySubscriptionResolverSDL, {
        many: {
          enableSubscriptions: true,
        },
      });
    });

    it('should not expose subscriptions if enableSubscriptions is false', () => {
      return expectResolverSDL(deleteBasicResolverSDL, { enableSubscriptions: false });
    });

    describe('delete one events', () => {
      it('should publish events for create one when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const input: DeleteOneInputType = {
          id: 'id-1',
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.DELETED_ONE, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.deleteOne(input.id)).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.deleteOne({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should publish events for create one when enableSubscriptions is set to true for createOne', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ one: { enableSubscriptions: true } });
        const input: DeleteOneInputType = {
          id: 'id-1',
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.DELETED_ONE, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.deleteOne(input.id)).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.deleteOne({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: false });
        const input: DeleteOneInputType = {
          id: 'id-1',
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        when(mockService.deleteOne(input.id)).thenResolve(output);
        const result = await resolver.deleteOne({ input });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          one: { enableSubscriptions: false },
        });
        const input: DeleteOneInputType = {
          id: 'id-1',
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        when(mockService.deleteOne(input.id)).thenResolve(output);
        const result = await resolver.deleteOne({ input });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('delete many events', () => {
      it('should publish events for create one when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const input: DeleteManyInputType<TestResolverDTO> = {
          filter: { id: { eq: 'id-1' } },
        };
        const output: DeleteManyResponse = { deletedCount: 1 };
        const eventName = getDTOEventName(EventType.DELETED_MANY, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.deleteMany({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should publish events for create manhy when many.enableSubscriptions is true', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ many: { enableSubscriptions: true } });
        const input: DeleteManyInputType<TestResolverDTO> = {
          filter: { id: { eq: 'id-1' } },
        };
        const output: DeleteManyResponse = { deletedCount: 1 };
        const eventName = getDTOEventName(EventType.DELETED_MANY, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.deleteMany({ input });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: false });
        const input: DeleteManyInputType<TestResolverDTO> = {
          filter: { id: { eq: 'id-1' } },
        };
        const output: DeleteManyResponse = { deletedCount: 1 };
        when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
        const result = await resolver.deleteMany({ input });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          many: { enableSubscriptions: false },
        });
        const input: DeleteManyInputType<TestResolverDTO> = {
          filter: { id: { eq: 'id-1' } },
        };
        const output: DeleteManyResponse = { deletedCount: 1 };
        when(mockService.deleteMany(objectContaining(input.filter))).thenResolve(output);
        const result = await resolver.deleteMany({ input });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('deletedOneSubscription', () => {
      it('should propagate events if enableSubscriptions is true', async () => {
        const { resolver, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
        });
        const eventName = getDTOEventName(EventType.DELETED_ONE, TestResolverDTO);

        const event: DeletedEvent<TestResolverDTO> = {
          [eventName]: {
            id: 'id-1',
            stringField: 'foo',
          },
        };
        const mockIterator = mock<AsyncIterator<DeletedEvent<TestResolverDTO>>>();
        when(mockPubSub.asyncIterator(eventName)).thenReturn(instance(mockIterator));
        when(mockIterator.next()).thenResolve({ done: false, value: event });
        const result = await resolver.deletedOneSubscription().next();
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
        const eventName = getDTOEventName(EventType.DELETED_ONE, TestResolverDTO);
        return expect(() => resolver.deletedOneSubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });

      it('should not propagate events if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: true,
          one: { enableSubscriptions: false },
        });
        const eventName = getDTOEventName(EventType.DELETED_ONE, TestResolverDTO);
        return expect(() => resolver.deletedOneSubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });
    });

    describe('deletedManySubscription', () => {
      it('should propagate events if enableSubscriptions is true', async () => {
        const { resolver, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const eventName = getDTOEventName(EventType.DELETED_MANY, TestResolverDTO);
        const event: DeleteManyResponse = { deletedCount: 1 };
        const mockIterator = mock<AsyncIterator<DeleteManyResponse>>();
        when(mockPubSub.asyncIterator(eventName)).thenReturn(instance(mockIterator));
        when(mockIterator.next()).thenResolve({ done: false, value: event });
        const result = await resolver.deletedManySubscription().next();
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
        const eventName = getDTOEventName(EventType.DELETED_MANY, TestResolverDTO);
        return expect(() => resolver.deletedManySubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });

      it('should not propagate events if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver } = await createTestResolver({
          enableSubscriptions: true,
          many: { enableSubscriptions: false },
        });
        const eventName = getDTOEventName(EventType.DELETED_MANY, TestResolverDTO);
        return expect(() => resolver.deletedManySubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });
    });
  });
});
