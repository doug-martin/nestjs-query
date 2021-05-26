// eslint-disable-next-line max-classes-per-file
import { DeepPartial } from '@nestjs-query/core';
import { Resolver, Query, InputType } from '@nestjs/graphql';
import { when, objectContaining, verify, deepEqual, anything, mock, instance } from 'ts-mockito';
import { PubSub } from 'graphql-subscriptions';
import { CreateManyInputType, CreateOneInputType, CreateResolver, CreateResolverOpts, InjectPubSub } from '../../src';
import { CreatedEvent } from '../../src/resolvers/create.resolver';
import { EventType, getDTOEventName } from '../../src/subscription';
import {
  generateSchema,
  createResolverFromNest,
  TestResolverDTO,
  TestResolverInputDTO,
  TestService,
} from '../__fixtures__';

describe('CreateResolver', () => {
  const expectResolverSDL = async (opts?: CreateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestSDLResolver extends CreateResolver(TestResolverDTO, opts) {
      @Query(() => TestResolverDTO)
      test(): TestResolverDTO {
        return { id: '1', stringField: 'foo' };
      }
    }

    const schema = await generateSchema([TestSDLResolver]);
    expect(schema).toMatchSnapshot();
  };

  const createTestResolver = (opts?: CreateResolverOpts<TestResolverDTO>) => {
    @Resolver(() => TestResolverDTO)
    class TestResolver extends CreateResolver(TestResolverDTO, opts) {
      constructor(service: TestService, @InjectPubSub() readonly pubSub: PubSub) {
        super(service);
      }
    }

    return createResolverFromNest(TestResolver);
  };

  it('should create a CreateResolver for the DTO', () => expectResolverSDL());

  it('should use the dtoName if provided', () => expectResolverSDL({ dtoName: 'Test' }));

  it('should use the one.name option for the createOne if provided', () =>
    expectResolverSDL({ one: { name: 'create_one_test' } }));

  it('should use the many.name option for the createMany if provided', () =>
    expectResolverSDL({ many: { name: 'create_many_test' } }));

  it('should use the CreateDTOClass if provided', () => expectResolverSDL({ CreateDTOClass: TestResolverInputDTO }));

  it('should not expose create methods if disabled', () => expectResolverSDL({ disabled: true }));

  describe('#createOne', () => {
    it('should use the provided CreateOneInput type', () => {
      @InputType()
      class CreateOneInput extends CreateOneInputType('createResolverDTO', TestResolverInputDTO) {}

      return expectResolverSDL({ CreateOneInput });
    });

    it('should not expose create one method if disabled', () => expectResolverSDL({ one: { disabled: true } }));

    it('should call the service createOne with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
        input: {
          stringField: 'foo',
        },
      };
      const output: TestResolverDTO = {
        id: 'id-1',
        stringField: 'foo',
      };
      when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createOne({ input: args });
      return expect(result).toEqual(output);
    });
  });

  describe('#createMany', () => {
    it('should not create a new type if the CreateManyArgs is supplied', () => {
      @InputType()
      class CreateManyInput extends CreateManyInputType('testResolvers', TestResolverInputDTO) {}

      return expectResolverSDL({ CreateManyInput });
    });

    it('should not expose create many method if disabled', () => expectResolverSDL({ many: { disabled: true } }));

    it('should call the service createMany with the provided input', async () => {
      const { resolver, mockService } = await createTestResolver();
      const args: CreateManyInputType<Partial<TestResolverDTO>> = {
        input: [
          {
            stringField: 'foo',
          },
        ],
      };
      const output: TestResolverDTO[] = [
        {
          id: 'id-1',
          stringField: 'foo',
        },
      ];
      when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
      const result = await resolver.createMany({ input: args });
      return expect(result).toEqual(output);
    });
  });

  describe('created subscription', () => {
    it('should add subscription types if enableSubscriptions is true', () =>
      expectResolverSDL({ enableSubscriptions: true }));

    it('should not expose subscriptions if enableSubscriptions is false', () =>
      expectResolverSDL({ enableSubscriptions: false }));

    describe('create one events', () => {
      it('should publish events for create one when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
          input: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.createOne({ input: args });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should publish events for create one when enableSubscriptions is set to true for createOne', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ one: { enableSubscriptions: true } });
        const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
          input: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);
        const event = { [eventName]: output };
        when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
        when(mockPubSub.publish(eventName, deepEqual(event))).thenResolve();
        const result = await resolver.createOne({ input: args });
        verify(mockPubSub.publish(eventName, deepEqual(event))).once();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: false });
        const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
          input: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
        const result = await resolver.createOne({ input: args });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and one.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          one: { enableSubscriptions: false },
        });
        const args: CreateOneInputType<DeepPartial<TestResolverDTO>> = {
          input: {
            stringField: 'foo',
          },
        };
        const output: TestResolverDTO = {
          id: 'id-1',
          stringField: 'foo',
        };
        when(mockService.createOne(objectContaining(args.input))).thenResolve(output);
        const result = await resolver.createOne({ input: args });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('create many events', () => {
      it('should publish events for create many when enableSubscriptions is set to true for all', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: true });
        const args: CreateManyInputType<Partial<TestResolverDTO>> = {
          input: [
            {
              stringField: 'foo',
            },
          ],
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);
        const events = output.map((o) => ({ [eventName]: o }));
        when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
        events.forEach((e) => when(mockPubSub.publish(eventName, deepEqual(e))).thenResolve());
        const result = await resolver.createMany({ input: args });
        events.forEach((e) => verify(mockPubSub.publish(eventName, deepEqual(e))).once());
        return expect(result).toEqual(output);
      });

      it('should publish events for create one when enableSubscriptions is set to true for createOne', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ many: { enableSubscriptions: true } });
        const args: CreateManyInputType<Partial<TestResolverDTO>> = {
          input: [
            {
              stringField: 'foo',
            },
          ],
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);
        const events = output.map((o) => ({ [eventName]: o }));
        when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
        events.forEach((e) => when(mockPubSub.publish(eventName, deepEqual(e))).thenResolve());
        const result = await resolver.createMany({ input: args });
        events.forEach((e) => verify(mockPubSub.publish(eventName, deepEqual(e))).once());
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({ enableSubscriptions: false });
        const args: CreateManyInputType<Partial<TestResolverDTO>> = {
          input: [
            {
              stringField: 'foo',
            },
          ],
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
        const result = await resolver.createMany({ input: args });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });

      it('should not publish an event if enableSubscriptions is true and many.enableSubscriptions is false', async () => {
        const { resolver, mockService, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
          many: { enableSubscriptions: false },
        });
        const args: CreateManyInputType<Partial<TestResolverDTO>> = {
          input: [
            {
              stringField: 'foo',
            },
          ],
        };
        const output: TestResolverDTO[] = [
          {
            id: 'id-1',
            stringField: 'foo',
          },
        ];
        when(mockService.createMany(objectContaining(args.input))).thenResolve(output);
        const result = await resolver.createMany({ input: args });
        verify(mockPubSub.publish(anything(), anything())).never();
        return expect(result).toEqual(output);
      });
    });

    describe('createSubscription', () => {
      it('should propagate events if enableSubscriptions is true', async () => {
        const { resolver, mockPubSub } = await createTestResolver({
          enableSubscriptions: true,
        });
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);

        const event: CreatedEvent<TestResolverDTO> = {
          [eventName]: {
            id: 'id-1',
            stringField: 'foo',
          },
        };
        const mockIterator = mock<AsyncIterator<CreatedEvent<TestResolverDTO>>>();
        when(mockPubSub.asyncIterator(eventName)).thenReturn(instance(mockIterator));
        when(mockIterator.next()).thenResolve({ done: false, value: event });
        const result = await resolver.createdSubscription().next();
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
        const eventName = getDTOEventName(EventType.CREATED, TestResolverDTO);
        return expect(() => resolver.createdSubscription()).toThrow(`Unable to subscribe to ${eventName}`);
      });
    });
  });
});
