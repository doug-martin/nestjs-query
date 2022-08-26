// eslint-disable-next-line max-classes-per-file
import { SkipIf } from '../../src/decorators'

describe('@SkipIf decorator', () => {
  describe('class decorator', () => {
    it('should call the decorator if the condition is false', () => {
      const dec = jest.fn()

      @SkipIf(() => false, dec)
      class TestSkipDecorator {}

      expect(dec).toHaveBeenCalledWith(TestSkipDecorator)
    })

    it('should not call the decorator if the condition is true', () => {
      const dec = jest.fn()

      @SkipIf(() => true, dec)
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestSkipDecorator {}

      expect(dec).not.toHaveBeenCalled()
    })
  })

  describe('property decorator', () => {
    it('should call the decorator if the condition is false', () => {
      const dec = jest.fn()

      class TestSkipDecorator {
        @SkipIf(() => false, dec)
        prop!: string
      }

      expect(dec).toHaveBeenCalledWith(TestSkipDecorator.prototype, 'prop', undefined)
    })

    it('should not call the decorator if the condition is true', () => {
      const dec = jest.fn()
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestSkipDecorator {
        @SkipIf(() => true, dec)
        prop!: string
      }

      expect(dec).not.toHaveBeenCalled()
    })
  })

  describe('method decorator', () => {
    it('should call the decorator if the condition is false', () => {
      const dec = jest.fn()

      class TestSkipDecorator {
        @SkipIf(() => false, dec)
        prop(): string {
          return 'str'
        }
      }

      expect(dec).toHaveBeenCalledWith(
        TestSkipDecorator.prototype,
        'prop',
        Object.getOwnPropertyDescriptor(TestSkipDecorator.prototype, 'prop')
      )
    })

    it('should not call the decorator if the condition is true', () => {
      const dec = jest.fn()
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestSkipDecorator {
        @SkipIf(() => true, dec)
        prop(): string {
          return 'str'
        }
      }

      expect(dec).not.toHaveBeenCalled()
    })
  })

  describe('parameter decorator', () => {
    it('should call the decorator if the condition is false', () => {
      const dec = jest.fn()

      class TestSkipDecorator {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        prop(@SkipIf(() => false, dec) param: string): string {
          return 'str'
        }
      }

      expect(dec).toHaveBeenCalledWith(TestSkipDecorator.prototype, 'prop', 0)
    })

    it('should not call the decorator if the condition is true', () => {
      const dec = jest.fn()
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestSkipDecorator {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        prop(@SkipIf(() => true, dec) param: string): string {
          return 'str'
        }
      }

      expect(dec).not.toHaveBeenCalled()
    })
  })
})
