/**
 * This is the doc comment for file1.ts
 * @packageDocumentation
 */
// eslint-disable-next-line max-classes-per-file
import { Class, DeepPartial, Filter, QueryService } from '@nestjs-query/core';
import { Args, ArgsType, InputType, PartialType, Resolver } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { HookTypes } from '../hooks';
import { DTONames, getDTONames } from '../common';
import { AuthorizerFilter, MutationHookArgs, ResolverMutation, ResolverSubscription } from '../decorators';
import { AuthorizerInterceptor, HookInterceptor } from '../interceptors';
import { EventType, getDTOEventName } from '../subscription';
import {
  CreateManyInputType,
  CreateOneInputType,
  MutationArgsType,
  SubscriptionArgsType,
  SubscriptionFilterInputType,
} from '../types';
import { createSubscriptionFilter, getSubscriptionEventName } from './helpers';
import { BaseServiceResolver, ResolverClass, ServiceResolver, SubscriptionResolverOpts } from './resolver.interface';
import { OperationGroup } from '../auth';

export type CreatedEvent<DTO> = { [eventName: string]: DTO };

export interface CreateResolverOpts<DTO, C = DeepPartial<DTO>> extends SubscriptionResolverOpts {
  /**
   * The Input DTO that should be used to create records.
   */
  CreateDTOClass?: Class<C>;
  /**
   * The class to be used for `createOne` input.
   */
  CreateOneInput?: Class<CreateOneInputType<C>>;
  /**
   * The class to be used for `createMany` input.
   */
  CreateManyInput?: Class<CreateManyInputType<C>>;

  createOneMutationName?: string;
  createManyMutationName?: string;
}

export interface CreateResolver<DTO, C, QS extends QueryService<DTO, C, unknown>> extends ServiceResolver<DTO, QS> {
  createOne(input: MutationArgsType<CreateOneInputType<C>>, authorizeFilter?: Filter<DTO>): Promise<DTO>;

  createMany(input: MutationArgsType<CreateManyInputType<C>>, authorizeFilter?: Filter<DTO>): Promise<DTO[]>;

  createdSubscription(
    input?: SubscriptionArgsType<DTO>,
    authorizeFilter?: Filter<DTO>,
  ): AsyncIterator<CreatedEvent<DTO>>;
}

/** @internal */
const defaultCreateDTO = <DTO, C>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<C> => {
  @InputType(`Create${dtoNames.baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class PartialInput extends PartialType(DTOClass, InputType) {}

  return PartialInput as Class<C>;
};

/** @internal */
const defaultCreateOneInput = <C>(dtoNames: DTONames, InputDTO: Class<C>): Class<CreateOneInputType<C>> => {
  const { baseName, baseNameLower } = dtoNames;
  @InputType(`CreateOne${baseName}Input`)
  class CO extends CreateOneInputType(baseNameLower, InputDTO) {}
  return CO;
};

/** @internal */
const defaultCreateManyInput = <C>(dtoNames: DTONames, InputDTO: Class<C>): Class<CreateManyInputType<C>> => {
  const { pluralBaseName, pluralBaseNameLower } = dtoNames;
  @InputType(`CreateMany${pluralBaseName}Input`)
  class CM extends CreateManyInputType(pluralBaseNameLower, InputDTO) {}
  return CM;
};

/**
 * @internal
 * Mixin to add `create` graphql endpoints.
 */
export const Creatable =
  <DTO, C, QS extends QueryService<DTO, C, unknown>>(DTOClass: Class<DTO>, opts: CreateResolverOpts<DTO, C>) =>
  <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<CreateResolver<DTO, C, QS>> & B => {
    const dtoNames = getDTONames(DTOClass, opts);
    const { baseName, pluralBaseName } = dtoNames;
    const enableSubscriptions = opts.enableSubscriptions === true;
    const enableOneSubscriptions = opts.one?.enableSubscriptions ?? enableSubscriptions;
    const enableManySubscriptions = opts.many?.enableSubscriptions ?? enableSubscriptions;
    const createdEvent = getDTOEventName(EventType.CREATED, DTOClass);
    const {
      CreateDTOClass = defaultCreateDTO(dtoNames, DTOClass),
      CreateOneInput = defaultCreateOneInput(dtoNames, CreateDTOClass),
      CreateManyInput = defaultCreateManyInput(dtoNames, CreateDTOClass),
    } = opts;
    const createOneMutationName = opts.one?.name ?? `createOne${baseName}`;
    const createManyMutationName = opts.many?.name ?? `createMany${pluralBaseName}`;
    const commonResolverOpts = omit(
      opts,
      'dtoName',
      'one',
      'many',
      'CreateDTOClass',
      'CreateOneInput',
      'CreateManyInput',
    );

    @ArgsType()
    class CO extends MutationArgsType(CreateOneInput) {}

    @ArgsType()
    class CM extends MutationArgsType(CreateManyInput) {}

    @InputType(`Create${baseName}SubscriptionFilterInput`)
    class SI extends SubscriptionFilterInputType(DTOClass) {}

    @ArgsType()
    class SA extends SubscriptionArgsType(SI) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const subscriptionFilter = createSubscriptionFilter(SI, createdEvent);

    @Resolver(() => DTOClass, { isAbstract: true })
    class CreateResolverBase extends BaseClass {
      @ResolverMutation(
        () => DTOClass,
        { name: createOneMutationName },
        commonResolverOpts,
        {
          interceptors: [
            HookInterceptor(HookTypes.BEFORE_CREATE_ONE, CreateDTOClass, DTOClass),
            AuthorizerInterceptor(DTOClass),
          ],
        },
        opts.one ?? {},
      )
      async createOne(
        @MutationHookArgs() input: CO,
        @AuthorizerFilter({
          operationGroup: OperationGroup.CREATE,
          many: false,
        }) // eslint-disable-next-line @typescript-eslint/no-unused-vars
        authorizeFilter?: Filter<DTO>,
      ): Promise<DTO> {
        // Ignore `authorizeFilter` for now but give users the ability to throw an UnauthorizedException
        const created = await this.service.createOne(input.input.input);
        if (enableOneSubscriptions) {
          await this.publishCreatedEvent(created, authorizeFilter);
        }
        return created;
      }

      @ResolverMutation(
        () => [DTOClass],
        { name: createManyMutationName },
        { ...commonResolverOpts },
        {
          interceptors: [
            HookInterceptor(HookTypes.BEFORE_CREATE_MANY, CreateDTOClass, DTOClass),
            AuthorizerInterceptor(DTOClass),
          ],
        },
        opts.many ?? {},
      )
      async createMany(
        @MutationHookArgs() input: CM,

        @AuthorizerFilter({
          operationGroup: OperationGroup.CREATE,
          many: true,
        }) // eslint-disable-next-line @typescript-eslint/no-unused-vars
        authorizeFilter?: Filter<DTO>,
      ): Promise<DTO[]> {
        // Ignore `authorizeFilter` for now but give users the ability to throw an UnauthorizedException
        const created = await this.service.createMany(input.input.input);
        if (enableManySubscriptions) {
          await Promise.all(created.map((c) => this.publishCreatedEvent(c, authorizeFilter)));
        }
        return created;
      }

      async publishCreatedEvent(dto: DTO, authorizeFilter?: Filter<DTO>): Promise<void> {
        if (this.pubSub) {
          const eventName = getSubscriptionEventName(createdEvent, authorizeFilter);
          await this.pubSub.publish(eventName, { [createdEvent]: dto });
        }
      }

      @ResolverSubscription(() => DTOClass, { name: createdEvent, filter: subscriptionFilter }, commonResolverOpts, {
        enableSubscriptions: enableOneSubscriptions || enableManySubscriptions,
        interceptors: [AuthorizerInterceptor(DTOClass)],
      })
      createdSubscription(
        @Args() input?: SA,
        @AuthorizerFilter({ operationGroup: OperationGroup.CREATE, many: false })
        authorizeFilter?: Filter<DTO>,
      ): AsyncIterator<CreatedEvent<DTO>> {
        if (!this.pubSub || !(enableManySubscriptions || enableOneSubscriptions)) {
          throw new Error(`Unable to subscribe to ${createdEvent}`);
        }

        const eventName = getSubscriptionEventName(createdEvent, authorizeFilter);
        return this.pubSub.asyncIterator<CreatedEvent<DTO>>(eventName);
      }
    }
    return CreateResolverBase;
  };

/**
 * Factory to create a new abstract class that can be extended to add `create` endpoints.
 *
 * Assume we have `TodoItemDTO`, you can create a resolver with `createOneTodoItem` and `createManyTodoItems` graphql
 * query endpoints using the following code.
 *
 * ```ts
 * @Resolver()
 * export class TodoItemResolver extends CreateResolver(TodoItemDTO) {
 *   constructor(readonly service: TodoItemService) {
 *    super(service);
 *   }
 * }
 * ```
 *
 * @param DTOClass - The DTO class that should be returned from the `createOne` and `createMany` endpoint.
 * @param opts - Options to customize endpoints.
 * @typeparam DTO - The type of DTO that should be created.
 * @typeparam C - The create DTO type.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const CreateResolver = <
  DTO,
  C = DeepPartial<DTO>,
  QS extends QueryService<DTO, C, unknown> = QueryService<DTO, C, unknown>,
>(
  DTOClass: Class<DTO>,
  opts: CreateResolverOpts<DTO, C> = {},
): ResolverClass<DTO, QS, CreateResolver<DTO, C, QS>> => Creatable(DTOClass, opts)(BaseServiceResolver);
