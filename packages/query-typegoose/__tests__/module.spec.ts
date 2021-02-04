import { NestjsQueryTypegooseModule } from '../src';
import { TestEntity } from './__fixtures__';

describe('NestjsQueryTypegooseModule', () => {
  it('should create a module', () => {
    const typegooseModule = NestjsQueryTypegooseModule.forFeature([TestEntity]);
    expect(typegooseModule.imports).toHaveLength(1);
    expect(typegooseModule.module).toBe(NestjsQueryTypegooseModule);
    expect(typegooseModule.providers).toHaveLength(1);
    expect(typegooseModule.exports).toHaveLength(2);
  });
});
