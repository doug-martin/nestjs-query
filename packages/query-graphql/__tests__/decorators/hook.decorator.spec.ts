// eslint-disable-next-line max-classes-per-file
import {
  BeforeCreateMany,
  BeforeCreateOne,
  BeforeUpdateOne,
  BeforeUpdateMany,
  BeforeDeleteOne,
  BeforeDeleteMany,
  BeforeQueryMany,
  BeforeFindOne,
} from '../../src';
import {
  getCreateManyHook,
  getCreateOneHook,
  getUpdateOneHook,
  getUpdateManyHook,
  getDeleteOneHook,
  getDeleteManyHook,
  getQueryManyHook,
  getFindOneHook,
} from '../../src/decorators';

describe('hook decorators', () => {
  describe('@BeforeCreateOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeCreateOne(hookFn)
      class Test {}

      expect(getCreateOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeCreateOne(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getCreateOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeCreateOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeCreateOne(childHookFn)
      class Test extends Base {}

      expect(getCreateOneHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeCreateMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeCreateMany(hookFn)
      class Test {}

      expect(getCreateManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeCreateMany(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getCreateManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeCreateMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeCreateMany(childHookFn)
      class Test extends Base {}

      expect(getCreateManyHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeUpdateOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeUpdateOne(hookFn)
      class Test {}

      expect(getUpdateOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeUpdateOne(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getUpdateOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeUpdateOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeUpdateOne(childHookFn)
      class Test extends Base {}

      expect(getUpdateOneHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeUpdateMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeUpdateMany(hookFn)
      class Test {}

      expect(getUpdateManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeUpdateMany(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getUpdateManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeUpdateMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeUpdateMany(childHookFn)
      class Test extends Base {}

      expect(getUpdateManyHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeDeleteOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeDeleteOne(hookFn)
      class Test {}

      expect(getDeleteOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeDeleteOne(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getDeleteOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeDeleteOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeDeleteOne(childHookFn)
      class Test extends Base {}

      expect(getDeleteOneHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeDeleteMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeDeleteMany(hookFn)
      class Test {}

      expect(getDeleteManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeDeleteMany(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getDeleteManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeDeleteMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeDeleteMany(childHookFn)
      class Test extends Base {}

      expect(getDeleteManyHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeQueryMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeQueryMany(hookFn)
      class Test {}

      expect(getQueryManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeQueryMany(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getQueryManyHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeQueryMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeQueryMany(childHookFn)
      class Test extends Base {}

      expect(getQueryManyHook(Test)).toBe(childHookFn);
    });
  });

  describe('@BeforeFindOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeFindOne(hookFn)
      class Test {}

      expect(getFindOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeFindOne(hookFn)
      class Base {}

      class Test extends Base {}

      expect(getFindOneHook(Test)).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeFindOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeFindOne(childHookFn)
      class Test extends Base {}

      expect(getFindOneHook(Test)).toBe(childHookFn);
    });
  });
});
