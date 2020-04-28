import { Injectable } from '@nestjs/common';
import { Class } from '../common';
import { Query } from '../interfaces';
import { getCoreMetadataStorage } from '../metadata';

export interface Assembler<DTO, Entity> {
  /**
   * Convert an entity to a DTO
   * @param entity - the entity to convert
   */
  convertToDTO(entity: Entity): DTO;

  /**
   * Convert a DTO to an entity.
   * @param dto - The dto to convert.
   */
  convertToEntity(dto: DTO): Entity;

  /**
   * Convert a DTO query to an entity query.
   * @param query - the query to convert.
   */
  convertQuery(query: Query<DTO>): Query<Entity>;

  /**
   * Convert an array of entities to a an of DTOs
   * @param entities - the entities to convert.
   */
  convertToDTOs(entities: Entity[]): DTO[];

  /**
   * Convert an array of DTOs to an array of entities.
   * @param dtos - the dtos to convert.
   */
  convertToEntities(dtos: DTO[]): Entity[];

  /**
   * Convert an entity to a DTO.
   * @param entity - the promise that should resolve with the entity.
   */
  convertAsyncToDTO(entity: Promise<Entity>): Promise<DTO>;
  /**
   * Convert an array of entities to an array of DTOs.
   * @param entities - the promise that should resolve with the entity array.
   */
  convertAsyncToDTOs(entities: Promise<Entity[]>): Promise<DTO[]>;
  /**
   * Convert a DTO to an entity.
   * @param dto - the promise that should resolve with the DTO.
   */
  convertAsyncToEntity(dto: Promise<DTO>): Promise<Entity>;

  /**
   * Convert an array of DTOs to an array of entities.
   * @param dtos - the promise that should resolve with the dtos.
   */
  convertAsyncToEntities(dtos: Promise<DTO[]>): Promise<Entity[]>;
}

/**
 * Class decorator for Assemblers to register them with nestjs-query
 * @param DTOClass - the DTO class.
 * @param EntityClass - The entity class.
 */
export function Assembler<DTO, Entity>(DTOClass: Class<DTO>, EntityClass: Class<Entity>) {
  return <Cls extends Class<Assembler<DTO, Entity>>>(cls: Cls): Cls | void => {
    if (getCoreMetadataStorage().hasAssembler(DTOClass, EntityClass)) {
      throw new Error(`Assembler already registered for ${DTOClass.name} ${EntityClass.name}`);
    }
    Injectable()(cls);
    getCoreMetadataStorage().addAssembler(DTOClass, EntityClass, cls);
    return cls;
  };
}

export type AssemblerSerializer<T> = (instance: T) => object;
export type AssemblerDeserializer<T> = (obj: object) => T;

export function AssemblerSerializer<T>(serializer: AssemblerSerializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (getCoreMetadataStorage().hasAssemblerSerializer(cls)) {
      throw new Error(`Assembler Serializer already registered for ${cls.name}`);
    }
    getCoreMetadataStorage().addAssemblerSerializer(cls, serializer);
    return cls;
  };
}

export function AssemblerDeserializer<T>(deserializer: AssemblerDeserializer<T>) {
  return <Cls extends Class<T>>(cls: Cls): Cls | void => {
    if (getCoreMetadataStorage().hasAssemblerDeserializer(cls)) {
      throw new Error(`Assembler Deserializer already registered for ${cls.name}`);
    }
    getCoreMetadataStorage().addAssemblerDeserializer(cls, deserializer);
    return cls;
  };
}
