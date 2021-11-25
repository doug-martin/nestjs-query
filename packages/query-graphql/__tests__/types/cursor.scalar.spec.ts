import { Kind } from 'graphql';
import { ConnectionCursorScalar } from '../../src';

describe('ConnectionCursorScalar', (): void => {
  describe('#parseValue', () => {
    it('should parse a value', () => {
      expect(ConnectionCursorScalar.parseValue('aaa')).toBe('aaa');
    });
  });

  describe('#serialize', () => {
    it('should serialize a value', () => {
      expect(ConnectionCursorScalar.serialize('aaa')).toBe('aaa');
    });
  });

  describe('#parseLiteral', () => {
    it('should parse a literal', () => {
      expect(ConnectionCursorScalar.parseLiteral({ kind: Kind.STRING, value: 'aaa' }, {})).toBe('aaa');
    });

    it('should return null if the ast.kind is not a string', () => {
      expect(ConnectionCursorScalar.parseLiteral({ kind: Kind.FLOAT, value: '1.0' }, {})).toBeNull();
    });
  });
});
