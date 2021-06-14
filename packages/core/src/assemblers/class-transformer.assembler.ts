import { plainToClass } from 'class-transformer';
import { AggregateQuery, AggregateResponse, Query } from '../interfaces';
import { AbstractAssembler } from './abstract.assembler';
import { Class, DeepPartial } from '../common';
import { getAssemblerSerializer } from './assembler.serializer';
import { getAssemblerDeserializer } from './assembler.deserializer';

/**
 * Base assembler that uses class-transformer to transform to and from the DTO/Entity.
 */
export abstract class ClassTransformerAssembler<DTO, Entity> extends AbstractAssembler<
  DTO,
  Entity,
  DeepPartial<DTO>,
  DeepPartial<Entity>,
  DeepPartial<DTO>,
  DeepPartial<Entity>
> {
  convertToDTO(entity: Entity): DTO {
    return this.convert(this.DTOClass, this.toPlain(entity));
  }

  convertToEntity(dto: DTO): Entity {
    return this.convert(this.EntityClass, this.toPlain(dto));
  }

  convertQuery(query: Query<DTO>): Query<Entity> {
    return query as Query<Entity>;
  }

  convertAggregateQuery(aggregate: AggregateQuery<DTO>): AggregateQuery<Entity> {
    return aggregate as unknown as AggregateQuery<Entity>;
  }

  convertAggregateResponse(aggregate: AggregateResponse<Entity>): AggregateResponse<DTO> {
    return aggregate as AggregateResponse<DTO>;
  }

  convertToCreateEntity(create: DeepPartial<DTO>): DeepPartial<Entity> {
    return this.convert(this.EntityClass, create);
  }

  convertToUpdateEntity(create: DeepPartial<DTO>): DeepPartial<Entity> {
    return this.convert(this.EntityClass, create);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  convert<T>(cls: Class<T>, obj: object): T {
    const deserializer = getAssemblerDeserializer(cls);
    if (deserializer) {
      return deserializer(obj);
    }
    return plainToClass(cls, obj);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  toPlain(entityOrDto: Entity | DTO): object {
    if (entityOrDto && entityOrDto instanceof this.EntityClass) {
      const serializer = getAssemblerSerializer(this.EntityClass);
      if (serializer) {
        return serializer(entityOrDto);
      }
    } else if (entityOrDto instanceof this.DTOClass) {
      const serializer = getAssemblerSerializer(this.DTOClass);
      if (serializer) {
        return serializer(entityOrDto);
      }
    } else if ('constructor' in entityOrDto) {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const serializer = getAssemblerSerializer((entityOrDto as object).constructor as Class<unknown>);
      if (serializer) {
        return serializer(entityOrDto);
      }
    }
    // eslint-disable-next-line @typescript-eslint/ban-types
    return entityOrDto as unknown as object;
  }
}
