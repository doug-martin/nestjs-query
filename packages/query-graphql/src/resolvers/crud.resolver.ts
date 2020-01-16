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
  create?: CreateResolverArgs<DTO, C>;
  read?: ReadResolverArgs<DTO>;
  update?: UpdateResolverArgs<DTO, U>;
  delete?: DeleteResolverArgs<DTO>;
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
    create = CreateDTOClass ? { CreateDTOClass } : {},
    read = {},
    update = UpdateDTOClass ? { UpdateDTOClass } : {},
    delete: deleteArgs = {},
  } = args;
  return Creatable(
    DTOClass,
    create,
  )(Readable(DTOClass, read)(Updateable(DTOClass, update)(DeleteResolver(DTOClass, deleteArgs))));
};
