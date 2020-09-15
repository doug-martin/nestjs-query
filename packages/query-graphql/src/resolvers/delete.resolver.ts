// eslint-disable-next-line max-classes-per-file
import { Class, DeleteManyResponse, mergeFilter } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ObjectType, ArgsType, Resolver, Args, PartialType, InputType, Context } from '@nestjs/graphql';
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
import {
  getDeleteManyHook,
  getDeleteOneHook,
  MutationArgs,
  ResolverMutation,
  ResolverSubscription,
} from '../decorators';
import { createSubscriptionFilter, getAuthFilter, transformAndValidate } from './helpers';

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
}

export interface DeleteResolver<DTO> extends ServiceResolver<DTO, any, any> {
  deleteOne(input: MutationArgsType<DeleteOneInputType>, context?: unknown): Promise<Partial<DTO>>;

  deleteMany(input: MutationArgsType<DeleteManyInputType<DTO>>, context?: unknown): Promise<DeleteManyResponse>;

  deletedOneSubscription(input?: SubscriptionArgsType<DTO>): AsyncIterator<DeletedEvent<Partial<DTO>>>;

  deletedManySubscription(): AsyncIterator<DeletedEvent<DeleteManyResponse>>;
}

/** @internal */
const defaultDeleteManyInput = <DTO>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<DeleteManyInputType<DTO>> => {
  const { pluralBaseName } = dtoNames;
  @InputType(`DeleteMany${pluralBaseName}Input`)
  class DM extends DeleteManyInputType(DTOClass) {}
  return DM;
};

/**
 * @internal
 * Mixin to add `delete` graphql endpoints.
 */
export const Deletable = <DTO>(DTOClass: Class<DTO>, opts: DeleteResolverOpts<DTO>) => <
  B extends Class<ServiceResolver<DTO, any, any>>
>(
  BaseClass: B,
): Class<DeleteResolver<DTO>> & B => {
  const dtoNames = getDTONames(DTOClass, opts);
  const { baseName, pluralBaseName } = dtoNames;
  const enableSubscriptions = opts.enableSubscriptions === true;
  const enableOneSubscriptions = opts.one?.enableSubscriptions ?? enableSubscriptions;
  const enableManySubscriptions = opts.many?.enableSubscriptions ?? enableSubscriptions;
  const deletedOneEvent = getDTOEventName(EventType.DELETED_ONE, DTOClass);
  const deletedManyEvent = getDTOEventName(EventType.DELETED_MANY, DTOClass);
  const { DeleteOneInput = DeleteOneInputType(), DeleteManyInput = defaultDeleteManyInput(dtoNames, DTOClass) } = opts;
  const deleteOneHook = getDeleteOneHook(DTOClass);
  const deleteManyHook = getDeleteManyHook(DTOClass);
  const DMR = DeleteManyResponseType();

  const commonResolverOpts = omit(opts, 'dtoName', 'one', 'many', 'DeleteOneInput', 'DeleteManyInput');

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
    @ResolverMutation(() => DeleteOneResponse, { name: `deleteOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async deleteOne(@MutationArgs(DO, deleteOneHook) input: DO, @Context() context?: unknown): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input);
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const deletedResponse = await this.service.deleteOne(deleteOne.input.id, { filter: authorizeFilter });
      if (enableOneSubscriptions) {
        await this.publishDeletedOneEvent(deletedResponse);
      }
      return deletedResponse;
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async deleteMany(
      @MutationArgs(DM, deleteManyHook) input: DM,
      @Context() context?: unknown,
    ): Promise<DeleteManyResponse> {
      const deleteMany = await transformAndValidate(DM, input);
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const deleteManyResponse = await this.service.deleteMany(
        mergeFilter(deleteMany.input.filter, authorizeFilter ?? {}),
      );
      if (enableManySubscriptions) {
        await this.publishDeletedManyEvent(deleteManyResponse);
      }
      return deleteManyResponse;
    }

    async publishDeletedOneEvent(dto: DeleteOneResponse): Promise<void> {
      if (this.pubSub) {
        await this.pubSub.publish(deletedOneEvent, { [deletedOneEvent]: dto });
      }
    }

    async publishDeletedManyEvent(dmr: DeleteManyResponse): Promise<void> {
      if (this.pubSub) {
        await this.pubSub.publish(deletedManyEvent, { [deletedManyEvent]: dmr });
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
    deletedOneSubscription(@Args() input?: DOSA): AsyncIterator<DeletedEvent<DeleteOneResponse>> {
      if (!enableOneSubscriptions || !this.pubSub) {
        throw new Error(`Unable to subscribe to ${deletedOneEvent}`);
      }
      return this.pubSub.asyncIterator(deletedOneEvent);
    }

    @ResolverSubscription(() => DMR, { name: deletedManyEvent }, commonResolverOpts, {
      enableSubscriptions: enableManySubscriptions,
    })
    deletedManySubscription(): AsyncIterator<DeletedEvent<DeleteManyResponse>> {
      if (!enableManySubscriptions || !this.pubSub) {
        throw new Error(`Unable to subscribe to ${deletedManyEvent}`);
      }
      return this.pubSub.asyncIterator(deletedManyEvent);
    }
  }
  return DeleteResolverBase;
};

export const DeleteResolver = <DTO>(
  DTOClass: Class<DTO>,
  opts: DeleteResolverOpts<DTO> = {},
): ResolverClass<DTO, any, any, DeleteResolver<DTO>> => Deletable(DTOClass, opts)(BaseServiceResolver);
