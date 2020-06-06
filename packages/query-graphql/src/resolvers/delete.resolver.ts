// eslint-disable-next-line max-classes-per-file
import { applyFilter, Class, DeleteManyResponse } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { ObjectType, ArgsType, Resolver, Args, PartialType, InputType } from '@nestjs/graphql';
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
import { ResolverMutation, ResolverSubscription } from '../decorators';
import { transformAndValidate } from './helpers';

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

export interface DeleteResolver<DTO> extends ServiceResolver<DTO> {
  deleteOne(input: MutationArgsType<DeleteOneInputType>): Promise<Partial<DTO>>;

  deleteMany(input: MutationArgsType<DeleteManyInputType<DTO>>): Promise<DeleteManyResponse>;

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
  B extends Class<ServiceResolver<DTO>>
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
  const deleteOneSubscriptionFilter = (payload: any, variables: DOSA): boolean => {
    if (variables.input?.filter) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const dto = payload[deletedOneEvent] as DTO;
      return applyFilter(dto, variables.input.filter);
    }
    return true;
  };

  @Resolver(() => DTOClass, { isAbstract: true })
  class DeleteResolverBase extends BaseClass {
    @ResolverMutation(() => DeleteOneResponse, { name: `deleteOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async deleteOne(@Args() input: DO): Promise<Partial<DTO>> {
      const deleteOne = await transformAndValidate(DO, input);
      const deletedResponse = await this.service.deleteOne(deleteOne.input.id);
      if (enableOneSubscriptions) {
        await this.publishDeletedOneEvent(deletedResponse);
      }
      return deletedResponse;
    }

    @ResolverMutation(() => DMR, { name: `deleteMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async deleteMany(@Args() input: DM): Promise<DeleteManyResponse> {
      const deleteMany = await transformAndValidate(DM, input);
      const deleteManyResponse = await this.service.deleteMany(deleteMany.input.filter);
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
): ResolverClass<DTO, DeleteResolver<DTO>> => Deletable(DTOClass, opts)(BaseServiceResolver);
