import { Class, DeepPartial, MapReflector, MetaValue, ValueReflector } from '../common'
import { AggregateQuery, AggregateResponse, Query } from '../interfaces'
import { ASSEMBLER_CLASSES_KEY, ASSEMBLER_KEY } from './constants'

export interface Assembler<
  DTO,
  Entity,
  CreateDTO = DeepPartial<DTO>,
  CreateEntity = DeepPartial<Entity>,
  UpdateDTO = CreateDTO,
  UpdateEntity = CreateEntity
> {
  /**
   * Convert an entity to a DTO
   * @param entity - the entity to convert
   */
  convertToDTO(entity: Entity): DTO

  /**
   * Convert a DTO to an entity.
   * @param dto - The dto to convert.
   */
  convertToEntity(dto: DTO): Entity

  /**
   * Convert a DTO query to an entity query.
   * @param query - the query to convert.
   */
  convertQuery(query: Query<DTO>): Query<Entity>

  /**
   * Convert a DTO query to an entity query.
   * @param aggregate - the aggregate query to convert.
   */
  convertAggregateQuery(aggregate: AggregateQuery<DTO>): AggregateQuery<Entity>

  /**
   * Convert a Entity aggregate response query to an dto aggregate.
   * @param aggregate - the aggregate query to convert.
   */
  convertAggregateResponse(aggregate: AggregateResponse<Entity>): AggregateResponse<DTO>

  /**
   * Convert a create dto input to the equivalent create entity type
   * @param createDTO
   */
  convertToCreateEntity(createDTO: CreateDTO): CreateEntity

  /**
   * Convert a update dto input to the equivalent update entity type
   * @param createDTO
   */
  convertToUpdateEntity(createDTO: UpdateDTO): UpdateEntity

  /**
   * Convert an array of entities to a an of DTOs
   * @param entities - the entities to convert.
   */
  convertToDTOs(entities: Entity[]): DTO[]

  /**
   * Convert an array of DTOs to an array of entities.
   * @param dtos - the dtos to convert.
   */
  convertToEntities(dtos: DTO[]): Entity[]

  /**
   * Convert an entity to a DTO.
   * @param entity - the promise that should resolve with the entity.
   */
  convertAsyncToDTO(entity: Promise<Entity>): Promise<DTO>

  /**
   * Convert an array of entities to an array of DTOs.
   * @param entities - the promise that should resolve with the entity array.
   */
  convertAsyncToDTOs(entities: Promise<Entity[]>): Promise<DTO[]>

  /**
   * Convert a DTO to an entity.
   * @param dto - the promise that should resolve with the DTO.
   */
  convertAsyncToEntity(dto: Promise<DTO>): Promise<Entity>

  /**
   * Convert an array of DTOs to an array of entities.
   * @param dtos - the promise that should resolve with the dtos.
   */
  convertAsyncToEntities(dtos: Promise<DTO[]>): Promise<Entity[]>

  /**
   * Convert an array of create DTOs to an array of create entities
   * @param createDtos
   */
  convertToCreateEntities(createDtos: CreateDTO[]): CreateEntity[]
}

const assemblerReflector = new ValueReflector(ASSEMBLER_CLASSES_KEY)
const reflector = new MapReflector<Class<unknown>>(ASSEMBLER_KEY)

export interface AssemblerClasses<DTO, Entity> {
  DTOClass: Class<DTO>
  EntityClass: Class<Entity>
}

/**
 * Class decorator for Assemblers to register them with nestjs-query
 * @param DTOClass - the DTO class.
 * @param EntityClass - The entity class.
 */
// eslint-disable-next-line @typescript-eslint/no-redeclare -- intentional
export function Assembler<
  DTO,
  Entity,
  C = DeepPartial<DTO>,
  CE = DeepPartial<Entity>,
  U = DeepPartial<DTO>,
  UE = DeepPartial<Entity>
>(DTOClass: Class<DTO>, EntityClass: Class<Entity>) {
  return <Cls extends Class<Assembler<DTO, Entity, C, CE, U, UE>>>(cls: Cls): Cls | void => {
    if (reflector.has(DTOClass, EntityClass)) {
      throw new Error(`Assembler already registered for ${DTOClass.name} ${EntityClass.name}`)
    }
    assemblerReflector.set(cls, { DTOClass, EntityClass })
    reflector.set(DTOClass, EntityClass, cls)
    return cls
  }
}

export function getAssemblers<DTO>(
  DTOClass: Class<DTO>
): MetaValue<Map<Class<unknown>, Class<Assembler<DTO, unknown, unknown, unknown, unknown, unknown>>>> {
  return reflector.get(DTOClass)
}

export function getAssemblerClasses<DTO, Entity, C, CE, U, UE>(
  AssemblerClass: Class<Assembler<DTO, Entity, C, CE, U, UE>>
): MetaValue<AssemblerClasses<DTO, Entity>> {
  return assemblerReflector.get(AssemblerClass)
}
