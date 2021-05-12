import {
  BeforeCreateManyHook,
  BeforeCreateOneHook,
  BeforeUpdateManyHook,
  BeforeUpdateOneHook,
  CreateManyInputType,
  CreateOneInputType,
  UpdateManyInputType,
  UpdateOneInputType,
} from '@nestjs-query/query-graphql';
import { Injectable } from '@nestjs/common';
import { GqlContext } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { getUserName } from './auth/helpers';

interface CreatedBy {
  createdBy: string;
}

interface UpdatedBy {
  updatedBy: string;
}

@Injectable()
export class CreatedByHook<T extends CreatedBy>
  implements BeforeCreateOneHook<T, GqlContext>, BeforeCreateManyHook<T, GqlContext>
{
  constructor(readonly authService: AuthService) {}

  run(instance: CreateManyInputType<T>, context: GqlContext): Promise<CreateManyInputType<T>>;
  run(instance: CreateOneInputType<T>, context: GqlContext): Promise<CreateOneInputType<T>>;
  async run(
    instance: CreateOneInputType<T> | CreateManyInputType<T>,
    context: GqlContext,
  ): Promise<CreateOneInputType<T> | CreateManyInputType<T>> {
    const createdBy = await this.authService.getUserEmail(getUserName(context));
    if (Array.isArray(instance.input)) {
      // eslint-disable-next-line no-param-reassign
      instance.input = instance.input.map((c) => ({ ...c, createdBy }));
      return instance;
    }
    // eslint-disable-next-line no-param-reassign
    instance.input.createdBy = createdBy;
    return instance;
  }
}

@Injectable()
export class UpdatedByHook<T extends UpdatedBy>
  implements BeforeUpdateOneHook<T, GqlContext>, BeforeUpdateManyHook<T, T, GqlContext>
{
  constructor(readonly authService: AuthService) {}

  run(instance: UpdateOneInputType<T>, context: GqlContext): Promise<UpdateOneInputType<T>>;
  run(instance: UpdateManyInputType<T, T>, context: GqlContext): Promise<UpdateManyInputType<T, T>>;
  async run(
    instance: UpdateOneInputType<T> | UpdateManyInputType<T, T>,
    context: GqlContext,
  ): Promise<UpdateOneInputType<T> | UpdateManyInputType<T, T>> {
    // eslint-disable-next-line no-param-reassign
    instance.update.updatedBy = await this.authService.getUserEmail(getUserName(context));
    return instance;
  }
}
