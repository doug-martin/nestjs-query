import 'reflect-metadata';
import { Query, Resolver } from '@nestjs/graphql';
import { UpdateManyResponse } from '@nestjs-query/core';
import { UpdateManyResponseType } from '../../src';
import { expectSDL, updateManyResponseTypeSDL } from '../__fixtures__';

describe('UpdateManyResponseType', () => {
  const URT = UpdateManyResponseType();
  it('should create a @nestjs/graphql object type', async () => {
    @Resolver()
    class UpdateManyResponseTypeResolver {
      @Query(() => URT)
      updateTest(): UpdateManyResponse {
        return { updatedCount: 1 };
      }
    }
    return expectSDL([UpdateManyResponseTypeResolver], updateManyResponseTypeSDL);
  });
});
