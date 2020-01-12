import { Class, DeepPartial } from '@nestjs-query/core';
import { Readable, ReadResolver, ReadResolverArgs } from './read.resolver';
import { Creatable, CreateResolver, CreateResolverArgs } from './create.resolver';
import { Updateable, UpdateResolver, UpdateResolverArgs } from './update.resolver';
import { DeleteResolver, DeleteResolverArgs } from './delete.resolver';

export type CRUDResolverArgs<
  DTO,
  C extends DeepPartial<DTO> = DeepPartial<DTO>,
  U extends DeepPartial<DTO> = DeepPartial<DTO>
> = {
  CreateDTOClass?: Class<C>;
  UpdateDTOClass?: Class<U>;
  createArgs?: CreateResolverArgs<DTO, C>;
  readArgs?: ReadResolverArgs<DTO>;
  updateArgs?: UpdateResolverArgs<DTO, U>;
  deleteArgs?: DeleteResolverArgs<DTO>;
};

type CRUDResolver<DTO, C extends DeepPartial<DTO>, U extends DeepPartial<DTO>> = Class<CreateResolver<DTO, C>> &
  Class<ReadResolver<DTO>> &
  Class<UpdateResolver<DTO, U>> &
  Class<DeleteResolver<DTO>>;

export const CRUDResolver = <DTO, C extends DeepPartial<DTO>, U extends DeepPartial<DTO>>(
  DTOClass: Class<DTO>,
  args: CRUDResolverArgs<DTO, C, U> = {},
): CRUDResolver<DTO, C, U> => {
  const {
    CreateDTOClass,
    UpdateDTOClass,
    createArgs = CreateDTOClass ? { CreateDTOClass } : {},
    readArgs = {},
    updateArgs = UpdateDTOClass ? { UpdateDTOClass } : {},
    deleteArgs = {},
  } = args;
  return Creatable(
    DTOClass,
    createArgs,
  )(Readable(DTOClass, readArgs)(Updateable(DTOClass, updateArgs)(DeleteResolver(DTOClass, deleteArgs))));
};
