import { plainToClass } from 'class-transformer';
import { Query } from '../interfaces';
import { AbstractAssembler } from './abstract.assembler';

/**
 * Base assembler that uses class-transformer to transform to and from the DTO/Entity.
 */
export abstract class ClassTransformerAssembler<DTO, Entity> extends AbstractAssembler<DTO, Entity> {
  convertToDTO(entity: Entity): DTO {
    return plainToClass(this.DTOClass, entity);
  }

  convertToEntity(dto: DTO): Entity {
    return plainToClass(this.EntityClass, dto);
  }

  convertQuery(query: Query<DTO>): Query<Entity> {
    return query as Query<Entity>;
  }
}
