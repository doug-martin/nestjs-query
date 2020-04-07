/**
 * This is the doc comment for file1.ts
 * @packageDocumentation
 */
// eslint-disable-next-line max-classes-per-file
import { Class, DeepPartial } from '@nestjs-query/core';
import omit from 'lodash.omit';
import { InputType, ArgsType, Args, Resolver, PartialType } from '@nestjs/graphql';
import { DTONames, getDTONames } from '../common';
import { BaseServiceResolver, ResolverClass, ResolverOpts, ServiceResolver } from './resolver.interface';
import { CreateManyInputType, CreateOneInputType, MutationArgsType } from '../types';
import { ResolverMutation } from '../decorators';
import { transformAndValidate } from './helpers';

export interface CreateResolverOpts<DTO, C extends DeepPartial<DTO> = DeepPartial<DTO>> extends ResolverOpts {
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
}

export interface CreateResolver<DTO, C extends DeepPartial<DTO>> extends ServiceResolver<DTO> {
  createOne(input: MutationArgsType<CreateOneInputType<C>>): Promise<DTO>;

  createMany(input: MutationArgsType<CreateManyInputType<C>>): Promise<DTO[]>;
}

/** @internal */
const defaultCreateDTO = <DTO, C extends DeepPartial<DTO>>(dtoNames: DTONames, DTOClass: Class<DTO>): Class<C> => {
  @InputType(`Create${dtoNames.baseName}`)
  // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
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
export const Creatable = <DTO, C extends DeepPartial<DTO>>(DTOClass: Class<DTO>, opts: CreateResolverOpts<DTO, C>) => <
  B extends Class<ServiceResolver<DTO>>
>(
  BaseClass: B,
): Class<CreateResolver<DTO, C>> & B => {
  const dtoNames = getDTONames(DTOClass, opts);
  const { baseName, pluralBaseName } = dtoNames;
  const {
    CreateDTOClass = defaultCreateDTO(dtoNames, DTOClass),
    CreateOneInput = defaultCreateOneInput(dtoNames, CreateDTOClass),
    CreateManyInput = defaultCreateManyInput(dtoNames, CreateDTOClass),
  } = opts;

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

  @Resolver(() => DTOClass, { isAbstract: true })
  class CreateResolverBase extends BaseClass {
    @ResolverMutation(() => DTOClass, { name: `createOne${baseName}` }, commonResolverOpts, opts.one ?? {})
    async createOne(@Args() input: CO): Promise<DTO> {
      const createOne = await transformAndValidate(CO, input);
      return this.service.createOne(createOne.input.input);
    }

    @ResolverMutation(() => [DTOClass], { name: `createMany${pluralBaseName}` }, commonResolverOpts, opts.many ?? {})
    async createMany(@Args() input: CM): Promise<DTO[]> {
      const createMany = await transformAndValidate(CM, input);
      return this.service.createMany(createMany.input.input);
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
export const CreateResolver = <DTO, C extends DeepPartial<DTO> = DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  opts: CreateResolverOpts<DTO, C> = {},
): ResolverClass<DTO, CreateResolver<DTO, C>> => Creatable(DTOClass, opts)(BaseServiceResolver);
