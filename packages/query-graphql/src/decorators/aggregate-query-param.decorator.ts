import { AggregateQuery } from '@nestjs-query/core';
import { GraphQLResolveInfo, SelectionNode, FieldNode, Kind } from 'graphql';
import { GqlExecutionContext } from '@nestjs/graphql';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const isFieldNode = (node: SelectionNode): node is FieldNode => {
  return node.kind === Kind.FIELD;
};

export const AggregateQueryParam = createParamDecorator(<DTO>(data: unknown, ctx: ExecutionContext) => {
  const info = GqlExecutionContext.create(ctx).getInfo<GraphQLResolveInfo>();
  const query = info.fieldNodes.map(({ selectionSet }) => {
    return selectionSet?.selections.reduce((aggQuery, selection) => {
      if (isFieldNode(selection)) {
        const aggType = selection.name.value;
        const fields = selection.selectionSet?.selections
          .map((s) => {
            if (isFieldNode(s)) {
              return s.name.value;
            }
            return undefined;
          })
          .filter((f) => !!f);
        return { ...aggQuery, [aggType]: fields };
      }
      return aggQuery;
    }, {} as AggregateQuery<DTO>);
  })[0];
  return query || {};
});
