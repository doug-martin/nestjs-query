import { Class, Filter } from '@nestjs-query/core';
import { CRUDAuthOptions, CRUDAuthService } from './crud-auth.interface';
import { getCRUDAuth, getRelations } from '../decorators';
import { ResolverRelation } from '../resolvers';

export function createDefaultCRUDAuthService<DTO>(DTOClass: Class<DTO>): Class<CRUDAuthService<DTO>> {
  const { many = {}, one = {} } = getRelations(DTOClass);
  const relationsAuthMap = new Map<string, CRUDAuthOptions<unknown> | undefined>();

  function getRelationAuth<Relation>(relation: ResolverRelation<Relation>) {
    const relationAuth = relation.auth;
    if (relationAuth) {
      return relationAuth;
    }
    return getCRUDAuth(relation.DTO);
  }

  Object.keys(many).forEach((relation) => relationsAuthMap.set(relation, getRelationAuth(many[relation])));
  Object.keys(one).forEach((relation) => relationsAuthMap.set(relation, getRelationAuth(one[relation])));
  class DefaultAuthService implements CRUDAuthService<DTO> {
    readonly authOptions?: CRUDAuthOptions<DTO> = getCRUDAuth(DTOClass);

    readonly relationsAuth: Map<string, CRUDAuthOptions<unknown> | undefined> = relationsAuthMap;

    async authFilter(context: any): Promise<Filter<DTO>> {
      return this.authOptions?.filter(context) ?? {};
    }

    async relationAuthFilter<Relation>(relationName: string, context: any): Promise<Filter<Relation>> {
      return this.relationsAuth.get(relationName)?.filter(context) ?? {};
    }
  }
  return DefaultAuthService;
}
