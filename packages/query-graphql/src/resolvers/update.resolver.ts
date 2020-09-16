// eslint-disable-next-line max-classes-per-file
import {
  Class,
  DeepPartial,
  DeleteManyResponse,
  mergeFilter,
  QueryService,
  UpdateManyResponse,
} from '@nestjs-query/core';
import { ArgsType, InputType, Resolver, Args, PartialType, Context } from '@nestjs/graphql';
import omit from 'lodash.omit';
import { DTONames, getDTONames } from '../common';
import { EventType, getDTOEventName } from '../subscription';
import {
  MutationArgsType,
  SubscriptionArgsType,
  SubscriptionFilterInputType,
  UpdateManyInputType,
  UpdateManyResponseType,
  UpdateOneInputType,
} from '../types';
import { BaseServiceResolver, ResolverClass, ServiceResolver, SubscriptionResolverOpts } from './resolver.interface';
import {
  ResolverMutation,
  ResolverSubscription,
  getUpdateOneHook,
  getUpdateManyHook,
  MutationArgs,
  UpdateOneHook,
  UpdateManyHook,
} from '../decorators';
import { createSubscriptionFilter, getAuthFilter, transformAndValidate } from './helpers';

export type UpdatedEvent<DTO> = { [eventName: string]: DTO };
export interface UpdateResolverOpts<DTO, U = DeepPartial<DTO>> extends SubscriptionResolverOpts {
  UpdateDTOClass?: Class<U>;
  UpdateOneInput?: Class<UpdateOneInputType<U>>;
  UpdateManyInput?: Class<UpdateManyInputType<DTO, U>>;
}

export interface UpdateResolver<DTO, U, QS extends QueryService<DTO, unknown, U>> extends ServiceResolver<DTO, QS> {
  updateOne(input: MutationArgsType<UpdateOneInputType<U>>, context?: unknown): Promise<DTO>;

  updateMany(input: MutationArgsType<UpdateManyInputType<DTO, U>>, context?: unknown): Promise<UpdateManyResponse>;

  updatedOneSubscription(input?: SubscriptionArgsType<DTO>): AsyncIterator<UpdatedEvent<DTO>>;

  updatedManySubscription(): AsyncIterator<UpdatedEvent<DeleteManyResponse>>;
}

/** @internal */
const defaultUpdateInput = <DTO, U>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<U> => {
  @InputType(`Update${dtoNames.baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  class UpdateType extends PartialType(DTOClass, InputType) {}

  return UpdateType as Class<U>;
};

/** @internal */
const defaultUpdateOneInput = <U>(dtoNames: DTONames, UpdateDTO: Class<U>): Class<UpdateOneInputType<U>> => {
  const { baseName } = dtoNames;

  @InputType(`UpdateOne${baseName}Input`)
  class UM extends UpdateOneInputType(UpdateDTO) {}

  return UM;
};

/** @internal */
const defaultUpdateManyInput = <DTO, U>(
  dtoNames: DTONames,
  DTOClass: Class<DTO>,
  UpdateDTO: Class<U>,
): Class<UpdateManyInputType<DTO, U>> => {
  const { pluralBaseName } = dtoNames;

  @InputType(`UpdateMany${pluralBaseName}Input`)
  class UM extends UpdateManyInputType(DTOClass, UpdateDTO) {}

  return UM;
};

const lookupUpdateOneHook = <DTO, U>(DTOClass: Class<DTO>, UpdateDTOClass: Class<U>): UpdateOneHook<U> | undefined => {
  return getUpdateOneHook(UpdateDTOClass) ?? getUpdateOneHook(DTOClass);
};

const lookupUpdateManyHook = <DTO, U>(
  DTOClass: Class<DTO>,
  UpdateDTOClass: Class<U>,
): UpdateManyHook<DTO, U> | undefined => {
  return (getUpdateManyHook(UpdateDTOClass) ?? getUpdateManyHook(DTOClass)) as UpdateManyHook<DTO, U> | undefined;
};

/**
 * @internal
 * Mixin to add `update` graphql endpoints.
 */
export const Updateable = <DTO, U, QS extends QueryService<DTO, unknown, U>>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverOpts<DTO, U>,
) => <B extends Class<ServiceResolver<DTO, QS>>>(BaseClass: B): Class<UpdateResolver<DTO, U, QS>> & B => {
  const dtoNames = getDTONames(DTOClass, opts);
  const { baseName, pluralBaseName } = dtoNames;
  const UMR = UpdateManyResponseType();
  const enableSubscriptions = opts.enableSubscriptions === true;
  const enableOneSubscriptions = opts.one?.enableSubscriptions ?? enableSubscriptions;
  const enableManySubscriptions = opts.many?.enableSubscriptions ?? enableSubscriptions;
  const updateOneEvent = getDTOEventName(EventType.UPDATED_ONE, DTOClass);
  const updateManyEvent = getDTOEventName(EventType.UPDATED_MANY, DTOClass);
  const {
    UpdateDTOClass = defaultUpdateInput(dtoNames, DTOClass),
    UpdateOneInput = defaultUpdateOneInput(dtoNames, UpdateDTOClass),
    UpdateManyInput = defaultUpdateManyInput(dtoNames, DTOClass, UpdateDTOClass),
  } = opts;
  const updateOneHook = lookupUpdateOneHook(DTOClass, UpdateDTOClass);
  const updateManyHook = lookupUpdateManyHook(DTOClass, UpdateDTOClass);

  const commonResolverOpts = omit(
    opts,
    'dtoName',
    'one',
    'many',
    'UpdateDTOClass',
    'UpdateOneInput',
    'UpdateManyInput',
  );

  @ArgsType()
  class UO extends MutationArgsType(UpdateOneInput) {}

  @ArgsType()
  class UM extends MutationArgsType(UpdateManyInput) {}

  @InputType(`UpdateOne${baseName}SubscriptionFilterInput`)
  class SI extends SubscriptionFilterInputType(DTOClass) {}

  @ArgsType()
  class UOSA extends SubscriptionArgsType(SI) {}

  const updateOneSubscriptionFilter = createSubscriptionFilter(SI, updateOneEvent);

  @Resolver(() => DTOClass, { isAbstract: true })
  class UpdateResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `updateOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async updateOne(@MutationArgs(UO, updateOneHook) input: UO, @Context() context?: unknown): Promise<DTO> {
      const updateOne = await transformAndValidate(UO, input);
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const { id, update } = updateOne.input;
      const updateResult = await this.service.updateOne(id, update, { filter: authorizeFilter });
      if (enableOneSubscriptions) {
        await this.publishUpdatedOneEvent(updateResult);
      }
      return updateResult;
    }

    @ResolverMutation(() => UMR, { name: `updateMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async updateMany(
      @MutationArgs(UM, updateManyHook) input: UM,
      @Context() context?: unknown,
    ): Promise<UpdateManyResponse> {
      const updateMany = await transformAndValidate(UM, input);
      const authorizeFilter = await getAuthFilter(this.authorizer, context);
      const { update, filter } = updateMany.input;
      const updateManyResponse = await this.service.updateMany(update, mergeFilter(filter, authorizeFilter ?? {}));
      if (enableManySubscriptions) {
        await this.publishUpdatedManyEvent(updateManyResponse);
      }
      return updateManyResponse;
    }

    async publishUpdatedOneEvent(dto: DTO): Promise<void> {
      if (this.pubSub) {
        await this.pubSub.publish(updateOneEvent, { [updateOneEvent]: dto });
      }
    }

    async publishUpdatedManyEvent(umr: UpdateManyResponse): Promise<void> {
      if (this.pubSub) {
        await this.pubSub.publish(updateManyEvent, { [updateManyEvent]: umr });
      }
    }

    @ResolverSubscription(
      () => DTOClass,
      { name: updateOneEvent, filter: updateOneSubscriptionFilter },
      commonResolverOpts,
      {
        enableSubscriptions: enableOneSubscriptions,
      },
    )
    // input required so graphql subscription filtering will work.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updatedOneSubscription(@Args() input?: UOSA): AsyncIterator<UpdatedEvent<DTO>> {
      if (!enableOneSubscriptions || !this.pubSub) {
        throw new Error(`Unable to subscribe to ${updateOneEvent}`);
      }
      return this.pubSub.asyncIterator(updateOneEvent);
    }

    @ResolverSubscription(() => UMR, { name: updateManyEvent }, commonResolverOpts, {
      enableSubscriptions: enableManySubscriptions,
    })
    updatedManySubscription(): AsyncIterator<UpdatedEvent<DeleteManyResponse>> {
      if (!enableManySubscriptions || !this.pubSub) {
        throw new Error(`Unable to subscribe to ${updateManyEvent}`);
      }
      return this.pubSub.asyncIterator(updateManyEvent);
    }
  }

  return UpdateResolverBase;
};

export const UpdateResolver = <
  DTO,
  U = DeepPartial<DTO>,
  QS extends QueryService<DTO, unknown, U> = QueryService<DTO, unknown, U>
>(
  DTOClass: Class<DTO>,
  opts: UpdateResolverOpts<DTO, U> = {},
): ResolverClass<DTO, QS, UpdateResolver<DTO, U, QS>> => Updateable(DTOClass, opts)(BaseServiceResolver);
