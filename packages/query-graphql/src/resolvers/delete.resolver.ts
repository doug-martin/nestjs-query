// eslint-disable-next-line max-classes-per-file
import { Class, DeleteManyResponse, Filter, mergeFilter, QueryService } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { Args, ArgsType, InputType, ObjectType, PartialType, Resolver } from '@nestjs/graphql';
import { HookTypes } from '../hooks';
import { DTONames, getDTONames } from '../common';
import { EventType, getDTOEventName } from '../subscription';
import { BaseServiceResolver, ResolverClass, ServiceResolver, SubscriptionResolverOpts } from './resolver.interface';
import {
  DeleteManyInputType,
  DeleteManyResponseType,
  DeleteOneInputType,
  MutationArgsType,
  SubscriptionArgsType,
  SubscriptionFilterInputType,
} from '../types';
import { MutationHookArgs, ResolverMutation, ResolverSubscription, AuthorizerFilter } from '../decorators';
import { createSubscriptionFilter, getSubscriptionEventName } from './helpers';
import { AuthorizerInterceptor, HookInterceptor } from '../interceptors';
import { OperationGroup } from '../auth';

export type DeletedEvent<DTO> = { [eventName: string]: DTO };
export interface DeleteResolverOpts<DTO> extends SubscriptionResolverOpts {
  /**
   * ArgsType for deleteOne mutation.
   */
  DeleteOneInput?: Class<DeleteOneInputType>;
  /**
   * ArgsType for deleteMany mutation.
   */
  DeleteManyInput?: Class<DeleteManyInputType<DTO>>;
  /**
   * Use soft delete when doing delete mutation
   */
  useSoftDelete?: boolean;
}

export interface DeleteResolver<DTO, QS extends QueryService<DTO, unknown, unknown>> extends ServiceResolver<DTO, QS> {
  deleteOne(input: MutationArgsType<DeleteOneInputType>, authorizeFilter?: Filter<DTO>): Promise<Partial<DTO>>;

  deleteMany(
    input: MutationArgsType<DeleteManyInputType<DTO>>,
    authorizeFilter?: Filter<DTO>,
  ): Promise<DeleteManyResponse>;

  deletedOneSubscription(
    input?: SubscriptionArgsType<DTO>,
    authorizeFilter?: Filter<DTO>,
  ): AsyncIterator<DeletedEvent<Partial<DTO>>>;

  deletedManySubscription(authorizeFilter?: Filter<DTO>): AsyncIterator<DeletedEvent<DeleteManyResponse>>;
}

/** @internal */
const defaultDeleteManyInput = <DTO>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<DeleteManyInputType<DTO>> => {
  const { pluralBaseName } = dtoNames;
  @InputType(`DeleteMany${pluralBaseName}Input`)
  class DM extends DeleteManyInputType(DTOClass) {}
  return DM;
};

/** @internal */
const defaultDeleteOneInput = <DTO>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<DeleteOneInputType> => {
  const { baseName } = dtoNames;
  @InputType(`DeleteOne${baseName}Input`)
  class DM extends DeleteOneInputType(DTOClass) {}
  return DM;
};

/**
 * @internal
 * Mixin to add `delete` graphql endpoints.
 */
export const Deletable =
  <DTO, QS extends QueryService<DTO, unknown, unknown>>(DTOClass: Class<DTO>, opts: DeleteResolverOpts<DTO>) =>
  <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<DeleteResolver<DTO, QS>> & B => {
    const dtoNames = getDTONames(DTOClass, opts);
    const { baseName, pluralBaseName } = dtoNames;
    const enableSubscriptions = opts.enableSubscriptions === true;
    const enableOneSubscriptions = opts.one?.enableSubscriptions ?? enableSubscriptions;
    const enableManySubscriptions = opts.many?.enableSubscriptions ?? enableSubscriptions;
    const deletedOneEvent = getDTOEventName(EventType.DELETED_ONE, DTOClass);
    const deletedManyEvent = getDTOEventName(EventType.DELETED_MANY, DTOClass);
    const {
      DeleteOneInput = defaultDeleteOneInput(dtoNames, DTOClass),
      DeleteManyInput = defaultDeleteManyInput(dtoNames, DTOClass),
    } = opts;
    const deleteOneMutationName = opts.one?.name ?? `deleteOne${baseName}`;
    const deleteManyMutationName = opts.many?.name ?? `deleteMany${pluralBaseName}`;
    const DMR = DeleteManyResponseType();

    const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'DeleteOneInput', 'DeleteManyInput', 'useSoftDelete');

    @ObjectType(`${baseName}DeleteResponse`)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    class DeleteOneResponse extends PartialType(DTOClass, ObjectType) {}

    @ArgsType()
    class DO extends MutationArgsType(DeleteOneInput) {}

    @ArgsType()
    class DM extends MutationArgsType(DeleteManyInput) {}

    @InputType(`DeleteOne${baseName}SubscriptionFilterInput`)
    class SI extends SubscriptionFilterInputType(DTOClass) {}

    @ArgsType()
    class DOSA extends SubscriptionArgsType(SI) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteOneSubscriptionFilter = createSubscriptionFilter(SI, deletedOneEvent);

    @Resolver(() => DTOClass, { isAbstract: true })
    class DeleteResolverBase extends BaseClass {
      @ResolverMutation(
        () => DeleteOneResponse,
        { name: deleteOneMutationName, description: opts?.one?.description },
        commonResolverOpts,
        { interceptors: [HookInterceptor(HookTypes.BEFORE_DELETE_ONE, DTOClass), AuthorizerInterceptor(DTOClass)] },
        opts.one ?? {},
      )
      async deleteOne(
        @MutationHookArgs() input: DO,
        @AuthorizerFilter({
          operationGroup: OperationGroup.DELETE,
          many: false,
        })
        authorizeFilter?: Filter<DTO>,
      ): Promise<Partial<DTO>> {
        const deletedResponse = await this.service.deleteOne(input.input.id, {
          filter: authorizeFilter ?? {},
          useSoftDelete: opts?.useSoftDelete,
        });
        if (enableOneSubscriptions) {
          await this.publishDeletedOneEvent(deletedResponse, authorizeFilter);
        }
        return deletedResponse;
      }

      @ResolverMutation(
        () => DMR,
        { name: deleteManyMutationName, description: opts?.many?.description },
        commonResolverOpts,
        { interceptors: [HookInterceptor(HookTypes.BEFORE_DELETE_MANY, DTOClass), AuthorizerInterceptor(DTOClass)] },
        opts.many ?? {},
      )
      async deleteMany(
        @MutationHookArgs() input: DM,
        @AuthorizerFilter({
          operationGroup: OperationGroup.DELETE,
          many: true,
        })
        authorizeFilter?: Filter<DTO>,
      ): Promise<DeleteManyResponse> {
        const deleteManyResponse = await this.service.deleteMany(
          mergeFilter(input.input.filter, authorizeFilter ?? {}),
          opts ?? {},
        );
        if (enableManySubscriptions) {
          await this.publishDeletedManyEvent(deleteManyResponse, authorizeFilter);
        }
        return deleteManyResponse;
      }

      async publishDeletedOneEvent(dto: DeleteOneResponse, authorizeFilter?: Filter<DTO>): Promise<void> {
        if (this.pubSub) {
          const eventName = getSubscriptionEventName(deletedOneEvent, authorizeFilter);
          await this.pubSub.publish(eventName, { [deletedOneEvent]: dto });
        }
      }

      async publishDeletedManyEvent(dmr: DeleteManyResponse, authorizeFilter?: Filter<DTO>): Promise<void> {
        if (this.pubSub) {
          const eventName = getSubscriptionEventName(deletedManyEvent, authorizeFilter);
          await this.pubSub.publish(eventName, { [deletedManyEvent]: dmr });
        }
      }

      @ResolverSubscription(
        () => DeleteOneResponse,
        { name: deletedOneEvent, filter: deleteOneSubscriptionFilter },
        commonResolverOpts,
        {
          enableSubscriptions: enableOneSubscriptions,
        },
      )
      // input required so graphql subscription filtering will work.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      deletedOneSubscription(
        @Args() input?: DOSA,
        @AuthorizerFilter({ operationGroup: OperationGroup.DELETE, many: false })
        authorizeFilter?: Filter<DTO>,
      ): AsyncIterator<DeletedEvent<DeleteOneResponse>> {
        if (!enableOneSubscriptions || !this.pubSub) {
          throw new Error(`Unable to subscribe to ${deletedOneEvent}`);
        }
        const eventName = getSubscriptionEventName(deletedOneEvent, authorizeFilter);
        return this.pubSub.asyncIterator(eventName);
      }

      @ResolverSubscription(() => DMR, { name: deletedManyEvent }, commonResolverOpts, {
        enableSubscriptions: enableManySubscriptions,
      })
      deletedManySubscription(
        @AuthorizerFilter({ operationGroup: OperationGroup.DELETE, many: true })
        authorizeFilter?: Filter<DTO>,
      ): AsyncIterator<DeletedEvent<DeleteManyResponse>> {
        if (!enableManySubscriptions || !this.pubSub) {
          throw new Error(`Unable to subscribe to ${deletedManyEvent}`);
        }
        const eventName = getSubscriptionEventName(deletedManyEvent, authorizeFilter);
        return this.pubSub.asyncIterator(eventName);
      }
    }
    return DeleteResolverBase;
  };
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export const DeleteResolver = <
  DTO,
  QS extends QueryService<DTO, unknown, unknown> = QueryService<DTO, unknown, unknown>,
>(
  DTOClass: Class<DTO>,
  opts: DeleteResolverOpts<DTO> = {},
): ResolverClass<DTO, QS, DeleteResolver<DTO, QS>> => Deletable<DTO, QS>(DTOClass, opts)(BaseServiceResolver);
