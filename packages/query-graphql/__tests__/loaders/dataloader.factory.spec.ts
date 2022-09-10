import { ExecutionContext } from '@nestjs/common'
import DataLoader from 'dataloader'

import { DataLoaderFactory } from '../../src/loader'

describe('DataLoaderFactory', () => {
  describe('getOrCreateLoader', () => {
    const createContext = (): ExecutionContext => ({} as unknown as ExecutionContext)

    const dataloadFn = (args: ReadonlyArray<string>): Promise<string[]> => Promise.resolve([...args])

    it('should create a dataloader and add it to the context', () => {
      const context = createContext()
      const loader = DataLoaderFactory.getOrCreateLoader(context, 'loader', dataloadFn)
      expect(loader).toBeInstanceOf(DataLoader)
    })

    it('should return the same dataloader if called twice', () => {
      const context = createContext()
      const loader = DataLoaderFactory.getOrCreateLoader(context, 'loader', dataloadFn)
      const loader2 = DataLoaderFactory.getOrCreateLoader(context, 'loader', dataloadFn)
      expect(loader).toBe(loader2)
    })
  })
})
