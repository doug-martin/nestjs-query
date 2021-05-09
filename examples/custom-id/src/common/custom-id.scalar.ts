import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('CustomID')
export class CustomIDScalar implements CustomScalar<string, number> {
  description = 'Global ID custom scalar type';

  private idPrefix = 'id:';

  parseValue(value: string): number {
    return parseInt(Buffer.from(value, 'base64').toString('utf8').replace(this.idPrefix, ''), 10);
  }

  serialize(value: number): string {
    return Buffer.from(`${this.idPrefix}${value}`, 'utf8').toString('base64');
  }

  parseLiteral(ast: ValueNode): number | null {
    if (ast.kind === Kind.STRING) {
      return this.parseValue(ast.value);
    }
    return null;
  }
}
