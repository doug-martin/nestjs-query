/* eslint-disable @typescript-eslint/no-unused-vars */
import { ResolverMethod, ResolverMethodOpts } from '../../src/decorators/resolver-method.decorator'

describe('ResolverMethod decorator', (): void => {
  function createTestResolver(...opts: ResolverMethodOpts[]): void {
    // @ts-ignore
    class TestResolver {
      @ResolverMethod(...opts)
      method(): boolean {
        return true
      }
    }
  }

  describe('decorators option', () => {
    it('should call the decorator', () => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const propDecorator = jest.fn((target: Object, propertyKey: string | symbol) => undefined)
      const opts = [{ decorators: [propDecorator] }]
      createTestResolver(...opts)
      expect(propDecorator).toHaveBeenCalledWith({}, 'method', expect.any(Object))
    })

    it('should call the decorator once', () => {
      // eslint-disable-next-line @typescript-eslint/ban-types
      const propDecorator = jest.fn((target: Object, propertyKey: string | symbol) => undefined)
      const opts = [{ decorators: [propDecorator] }, { decorators: [propDecorator] }]
      createTestResolver(...opts)
      expect(propDecorator).toHaveBeenCalledTimes(1)
      expect(propDecorator).toHaveBeenCalledWith({}, 'method', expect.any(Object))
    })
  })
})
