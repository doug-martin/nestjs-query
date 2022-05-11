import { queryTypeorm } from './query-typeorm';

describe('queryTypeorm', () => {
  it('should work', () => {
    expect(queryTypeorm()).toEqual('query-typeorm');
  });
});
