import 'reflect-metadata';
import { getMetadataStorage } from '../../../src/metadata';
import { PageInfoType } from '../../../src/types/connection';

describe('PageInfoType', (): void => {
  afterEach(() => getMetadataStorage().clear());

  it('should cache page info type', () => {
    expect(PageInfoType()).toBe(PageInfoType());
  });
});
