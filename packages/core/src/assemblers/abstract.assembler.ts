import { Class, DeepPartial } from '../common'
import { AggregateQuery, AggregateResponse, Query } from '../interfaces'
import { Assembler, getAssemblerClasses } from './assembler'

/**
 * Base implementation for Assemblers that requires the implementation of.
 * * convertToDTO
 * * convertToEntity
 * * convertQuery
 *
 */
export abstract class AbstractAssembler<DTO, Entity, C = DeepPartial<DTO>, CE = DeepPartial<Entity>, U = C, UE = CE>
  implements Assembler<DTO, Entity, C, CE, U, UE>
{
  readonly DTOClass: Class<DTO>

  readonly EntityClass: Class<Entity>

  /**
   * @param DTOClass - Optional class definition for the DTO. If not provided it will be looked up from the \@Assembler annotation.
   * @param EntityClass - Optional class definition for the entity. If not provided it will be looked up from the \@Assembler annotation.
   */
  constructor(DTOClass?: Class<DTO>, EntityClass?: Class<Entity>) {
    const classes = getAssemblerClasses(this.constructor as Class<Assembler<DTO, Entity, C, CE, U, UE>>)
    const DTOClas = DTOClass ?? classes?.DTOClass
    const EntityClas = EntityClass ?? classes?.EntityClass
    if (!DTOClas || !EntityClas) {
      // the DTO and entity classes were not provided and we didnt find them in the metadata storage.
      throw new Error(
        `Unable to determine DTO or Entity types for ${this.constructor.name}. Did you annotate your assembler with @Assembler`
      )
    }
    this.DTOClass = DTOClas
    this.EntityClass = EntityClas
  }

  abstract convertToDTO(entity: Entity): DTO

  abstract convertToEntity(dto: DTO): Entity

  abstract convertQuery(query: Query<DTO>): Query<Entity>

  abstract convertAggregateQuery(aggregate: AggregateQuery<DTO>): AggregateQuery<Entity>

  abstract convertAggregateResponse(aggregate: AggregateResponse<Entity>): AggregateResponse<DTO>

  abstract convertToCreateEntity(create: C): CE

  abstract convertToUpdateEntity(update: U): UE

  convertToDTOs(entities: Entity[]): DTO[] {
    return entities.map((e) => this.convertToDTO(e))
  }

  convertToEntities(dtos: DTO[]): Entity[] {
    return dtos.map((dto) => this.convertToEntity(dto))
  }

  convertToCreateEntities(createDtos: C[]): CE[] {
    return createDtos.map((c) => this.convertToCreateEntity(c))
  }

  async convertAsyncToDTO(entity: Promise<Entity>): Promise<DTO> {
    const e = await entity
    return this.convertToDTO(e)
  }

  async convertAsyncToDTOs(entities: Promise<Entity[]>): Promise<DTO[]> {
    const es = await entities
    return this.convertToDTOs(es)
  }

  async convertAsyncToEntity(dto: Promise<DTO>): Promise<Entity> {
    const d = await dto
    return this.convertToEntity(d)
  }

  async convertAsyncToEntities(dtos: Promise<DTO[]>): Promise<Entity[]> {
    const ds = await dtos
    return this.convertToEntities(ds)
  }
}
