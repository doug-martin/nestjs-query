import { NestjsQueryTypeOrmModule } from '../src'

describe('NestjsQueryTypeOrmModule', () => {
  it('should create a module', () => {
    class TestEntity {}

    const typeOrmModule = NestjsQueryTypeOrmModule.forFeature([TestEntity])
    expect(typeOrmModule.imports).toHaveLength(1)
    expect(typeOrmModule.module).toBe(NestjsQueryTypeOrmModule)
    expect(typeOrmModule.providers).toHaveLength(1)
    expect(typeOrmModule.exports).toHaveLength(2)
  })
})
