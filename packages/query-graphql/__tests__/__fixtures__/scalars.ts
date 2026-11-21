import { CustomScalar, Field, InputType, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Point', () => Object)
export class PointScalar implements CustomScalar<unknown, unknown> {
  description = 'Date custom scalar type';

  parseValue(value: unknown): unknown {
    return value;
  }

  serialize(value: unknown): unknown {
    return value;
  }

  parseLiteral(ast: ValueNode): unknown {
    if (ast.kind === Kind.OBJECT) {
      return ast.fields;
    }
    return null;
  }
}

@InputType('DistanceFilter')
export class DistanceFilter {
  @Field(() => Number)
  lat!: number;

  @Field(() => Number)
  lng!: number;

  @Field(() => Number)
  radius!: number;
}
