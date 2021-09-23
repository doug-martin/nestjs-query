import { ModuleRef } from '@nestjs/core';
import { Class, Filter } from '@nestjs-query/core';
import { Injectable, Inject, Optional } from '@nestjs/common';
import { getAuthorizer, getRelations } from '../decorators';
import { getAuthorizerToken, getCustomAuthorizerToken } from './tokens';
import { ResolverRelation } from '../resolvers/relations';
import { Authorizer, AuthorizationContext, CustomAuthorizer } from './authorizer';

export interface AuthorizerOptions<DTO> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any, authorizationContext: AuthorizationContext) => Filter<DTO> | Promise<Filter<DTO>>;
}

const createRelationAuthorizer = (opts: AuthorizerOptions<unknown>): Authorizer<unknown> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(context: any, authorizationContext: AuthorizationContext): Promise<Filter<unknown>> {
    return opts.authorize(context, authorizationContext) ?? {};
  },
  authorizeRelation(): Promise<Filter<unknown>> {
    return Promise.reject(new Error('Not implemented'));
  },
});

export function createDefaultAuthorizer<DTO>(
  DTOClass: Class<DTO>,
  opts?: CustomAuthorizer<DTO> | AuthorizerOptions<DTO>, // instance of class or authorizer options
): Class<Authorizer<DTO>> {
  @Injectable()
  class DefaultAuthorizer implements Authorizer<DTO> {
    readonly authOptions?: AuthorizerOptions<DTO> | CustomAuthorizer<DTO> = opts;

    readonly relationsAuthorizers: Map<string, Authorizer<unknown> | undefined>;

    private readonly relations: Map<string, ResolverRelation<unknown>>;

    constructor(
      private readonly moduleRef: ModuleRef,
      @Optional() @Inject(getCustomAuthorizerToken(DTOClass)) private readonly customAuthorizer?: CustomAuthorizer<DTO>,
    ) {
      this.relationsAuthorizers = new Map<string, Authorizer<unknown> | undefined>();
      this.relations = this.getRelations();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authorize(context: any, authorizationContext: AuthorizationContext): Promise<Filter<DTO>> {
      return (
        this.customAuthorizer?.authorize(context, authorizationContext) ??
        this.authOptions?.authorize(context, authorizationContext) ??
        {}
      );
    }

    async authorizeRelation(
      relationName: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: any,
      authorizationContext: AuthorizationContext,
    ): Promise<Filter<unknown>> {
      if (this.customAuthorizer && typeof this.customAuthorizer.authorizeRelation === 'function') {
        const filterFromCustomAuthorizer = await this.customAuthorizer.authorizeRelation(
          relationName,
          context,
          authorizationContext,
        );
        if (filterFromCustomAuthorizer) return filterFromCustomAuthorizer;
      }
      this.addRelationAuthorizerIfNotExist(relationName);
      return this.relationsAuthorizers.get(relationName)?.authorize(context, authorizationContext) ?? {};
    }

    private addRelationAuthorizerIfNotExist(relationName: string) {
      if (!this.relationsAuthorizers.has(relationName)) {
        const relation = this.relations.get(relationName);
        if (!relation) return;
        if (relation.auth) {
          this.relationsAuthorizers.set(relationName, createRelationAuthorizer(relation.auth));
        } else if (getAuthorizer(relation.DTO)) {
          this.relationsAuthorizers.set(
            relationName,
            this.moduleRef.get(getAuthorizerToken(relation.DTO), { strict: false }),
          );
        }
      }
    }

    private getRelations(): Map<string, ResolverRelation<unknown>> {
      const { many = {}, one = {} } = getRelations(DTOClass);
      const relationsMap = new Map<string, ResolverRelation<unknown>>();
      Object.keys(many).forEach((relation) => relationsMap.set(relation, many[relation]));
      Object.keys(one).forEach((relation) => relationsMap.set(relation, one[relation]));
      return relationsMap;
    }
  }
  return DefaultAuthorizer;
}
