import { BadRequestException } from '@nestjs/common'
import { IsInt, Min } from 'class-validator'

import { transformAndValidate } from '../../src/resolvers/helpers'

describe('helpers', () => {
  describe('transformAndValidate', () => {
    class TestClass {
      @IsInt()
      @Min(0)
      int = 0
    }

    it('should not transform or validate a class that is already an instance', async () => {
      const instance = new TestClass()
      const v = await transformAndValidate(TestClass, instance)
      expect(v).toBe(instance)
    })

    it('should transform and validate an object into the class', async () => {
      const v = await transformAndValidate(TestClass, { int: 1 })
      expect(v).toBeInstanceOf(TestClass)
      expect(v.int).toBe(1)
      return expect(transformAndValidate(TestClass, { int: -1 })).rejects.toBeInstanceOf(BadRequestException)
    })
  })
})
