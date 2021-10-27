import { AuthorizationContext, Authorizer } from './authorizer';
import { Class, Filter } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { TypeMetadataStorage } from '@nestjs/graphql';
import { getRelations } from '../decorators';
import { getAuthorizerToken } from './tokens';

@Injectable()
export class GlobalAuthorizer {
  private readonly authorizers: Map<string, Authorizer<unknown>> = new Map<string, Authorizer<unknown>>();

  private readonly relationDtos: Map<string, Class<unknown>> = new Map<string, Class<unknown>>();

  constructor(private readonly moduleRef: ModuleRef) {}

  async authorize<DTO extends Class<unknown>>(
    dto: DTO,
    context: any,
    authorizationContext: AuthorizationContext,
  ): Promise<Filter<DTO>> {
    const authorizer = this.getAuthorizer(dto);
    return (await authorizer?.authorize(context, authorizationContext)) ?? {};
  }

  async authorizeRelation<ParentDTO extends Class<unknown>, RelationDTO extends Class<unknown>>(
    dto: ParentDTO,
    relationName: string,
    context: any,
    authorizationContext: AuthorizationContext,
  ): Promise<Filter<RelationDTO>> {
    // First, try to get the filter from ParentDTO.authorizeRelation
    const parentAuthorizer = this.getAuthorizer(dto);
    if (parentAuthorizer.authorizeRelation) {
      const relationFilter = await parentAuthorizer.authorizeRelation(relationName, context, authorizationContext);
      if (relationFilter) return relationFilter;
    }
    // Fallback to the relationDTO.authorize
    const filter = await this.getAuthorizer(this.getRelationDto(dto, relationName)).authorize(
      context,
      authorizationContext,
    );
    if (filter) return filter;
    return {};
  }

  private getAuthorizer<DTO extends Class<unknown>>(dto: DTO): Authorizer<unknown> {
    const name = TypeMetadataStorage.getObjectTypeMetadataByTarget(dto)?.name;
    if (!name) throw new Error(`${dto.name} is not an ObjectType`);
    let authorizer = this.authorizers.get(name);
    if (!authorizer) {
      authorizer = this.moduleRef.get<string, Authorizer<unknown>>(getAuthorizerToken(dto), { strict: false });
      this.authorizers.set(name, authorizer);
    }
    return authorizer;
  }

  private getRelationDto<ParentDTO extends Class<unknown>>(parentDto: ParentDTO, relationName: string): Class<unknown> {
    const name = TypeMetadataStorage.getObjectTypeMetadataByTarget(parentDto)?.name;
    if (!name) throw new Error(`${parentDto.name} is not an ObjectType`);
    const relationKey = `${name}.${relationName}`;
    let relationDto = this.relationDtos.get(relationKey);
    if (!relationDto) {
      const { many = {}, one = {} } = getRelations(parentDto);
      const relation = Object.entries({ ...many, ...one }).find((entry) => entry[0] === relationName);
      if (!relation) throw new Error(`Relation ${relationName} does not exist on ${name}`);
      relationDto = relation[1].DTO;
      this.relationDtos.set(relationKey, relationDto);
    }
    return relationDto;
  }
}
