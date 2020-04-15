import 'reflect-metadata';
import { Resolver, Query } from '@nestjs/graphql';
import { DeleteManyResponse } from '@nestjs-query/core';
import { DeleteManyResponseType } from '../../src/types';
import { deleteManyResponseTypeSDL, expectSDL } from '../__fixtures__';

describe('DeleteManyResponseType', (): void => {
  it('should create a @nestjs/graphql object type', async () => {
    const D = DeleteManyResponseType();
    @Resolver()
    class TestDeleteManyResponseResolver {
      @Query(() => D)
      deleteTest(): DeleteManyResponse {
        return { deletedCount: 1 };
      }
    }
    return expectSDL([TestDeleteManyResponseResolver], deleteManyResponseTypeSDL);
  });
});
