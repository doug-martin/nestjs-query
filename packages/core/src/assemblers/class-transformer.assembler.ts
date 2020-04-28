import { plainToClass } from 'class-transformer';
import { Query } from '../interfaces';
import { getCoreMetadataStorage } from '../metadata';
import { AbstractAssembler } from './abstract.assembler';
import { Class } from '../common';

/**
 * Base assembler that uses class-transformer to transform to and from the DTO/Entity.
 */
export abstract class ClassTransformerAssembler<DTO, Entity> extends AbstractAssembler<DTO, Entity> {
  convertToDTO(entity: Entity): DTO {
    return this.convert(this.DTOClass, this.toPlain(entity));
  }

  convertToEntity(dto: DTO): Entity {
    return this.convert(this.EntityClass, this.toPlain(dto));
  }

  convertQuery(query: Query<DTO>): Query<Entity> {
    return query as Query<Entity>;
  }

  convert<T>(cls: Class<T>, obj: object): T {
    const deserializer = getCoreMetadataStorage().getAssemblerDeserializer(cls);
    if (deserializer) {
      return deserializer(obj);
    }
    return plainToClass(cls, obj);
  }

  toPlain(entityOrDto: Entity | DTO): object {
    if (entityOrDto instanceof this.EntityClass) {
      const serializer = getCoreMetadataStorage().getAssemblerSerializer(this.EntityClass);
      if (serializer) {
        return serializer(entityOrDto);
      }
    } else if (entityOrDto instanceof this.DTOClass) {
      const serializer = getCoreMetadataStorage().getAssemblerSerializer(this.DTOClass);
      if (serializer) {
        return serializer(entityOrDto);
      }
    }
    return (entityOrDto as unknown) as object;
  }
}
