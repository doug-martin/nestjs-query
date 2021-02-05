import { ModuleRef } from '@nestjs/core';
import { Class, Filter } from '@nestjs-query/core';
import { Injectable } from '@nestjs/common';
import { getAuthorizer, getRelations } from '../decorators';
import { getAuthorizerToken } from './tokens';
import { ResolverRelation } from '../resolvers/relations';
import { Authorizer } from './authorizer';

export interface AuthorizerOptions<DTO> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any) => Filter<DTO> | Promise<Filter<DTO>>;
}

const createRelationAuthorizer = (opts: AuthorizerOptions<unknown>): Authorizer<unknown> => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async authorize(context: any): Promise<Filter<unknown>> {
    return opts.authorize(context) ?? {};
  },
  authorizeRelation(): Promise<Filter<unknown>> {
    return Promise.reject(new Error('Not implemented'));
  },
});

export function createDefaultAuthorizer<DTO>(
  DTOClass: Class<DTO>,
  opts: AuthorizerOptions<DTO>,
): Class<Authorizer<DTO>> {
  @Injectable()
  class DefaultAuthorizer implements Authorizer<DTO> {
    readonly authOptions: AuthorizerOptions<DTO> = opts;

    readonly relationsAuthorizers: Map<string, Authorizer<unknown> | undefined>;

    constructor(moduleRef: ModuleRef) {
      this.relationsAuthorizers = new Map<string, Authorizer<unknown> | undefined>();
      this.relations.forEach((value, key) => {
        if (value.auth) {
          this.relationsAuthorizers.set(key, createRelationAuthorizer(value.auth));
        } else if (getAuthorizer(value.DTO)) {
          this.relationsAuthorizers.set(key, moduleRef.get(getAuthorizerToken(value.DTO), { strict: false }));
        }
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authorize(context: any): Promise<Filter<DTO>> {
      return this.authOptions?.authorize(context) ?? {};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authorizeRelation(relationName: string, context: any): Promise<Filter<unknown>> {
      return this.relationsAuthorizers.get(relationName)?.authorize(context) ?? {};
    }

    private get relations(): Map<string, ResolverRelation<unknown>> {
      const { many = {}, one = {} } = getRelations(DTOClass);
      const relationsMap = new Map<string, ResolverRelation<unknown>>();
      Object.keys(many).forEach((relation) => relationsMap.set(relation, many[relation]));
      Object.keys(one).forEach((relation) => relationsMap.set(relation, one[relation]));
      return relationsMap;
    }
  }
  return DefaultAuthorizer;
}
