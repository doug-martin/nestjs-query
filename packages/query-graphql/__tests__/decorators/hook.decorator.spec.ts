/* eslint-disable @typescript-eslint/unbound-method */
// eslint-disable-next-line max-classes-per-file
import { Class } from '@nestjs-query/core';
import {
  BeforeCreateMany,
  BeforeCreateOne,
  BeforeUpdateOne,
  BeforeUpdateMany,
  BeforeDeleteOne,
  BeforeDeleteMany,
  BeforeQueryMany,
  BeforeFindOne,
  Hook,
} from '../../src';
import { getHookForType } from '../../src/decorators';
import { createDefaultHook, HookTypes } from '../../src/hooks';

describe('hook decorators', () => {
  describe('@BeforeCreateOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeCreateOne(hookFn)
      class Test {}
      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeCreateOne(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeCreateOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeCreateOne(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_ONE, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeCreateOne(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_CREATE_ONE, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeCreateMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeCreateMany(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeCreateMany(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeCreateMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeCreateMany(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_CREATE_MANY, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeCreateMany(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_CREATE_MANY, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeUpdateOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeUpdateOne(hookFn)
      class Test {}
      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeUpdateOne(hookFn)
      class Base {}

      class Test extends Base {}
      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeUpdateOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeUpdateOne(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_ONE, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeUpdateOne(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_UPDATE_ONE, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeUpdateMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeUpdateMany(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeUpdateMany(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeUpdateMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeUpdateMany(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_UPDATE_MANY, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeUpdateMany(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_UPDATE_MANY, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeDeleteOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeDeleteOne(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeDeleteOne(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeDeleteOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeDeleteOne(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_ONE, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeDeleteOne(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_DELETE_ONE, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeDeleteMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeDeleteMany(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeDeleteMany(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeDeleteMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeDeleteMany(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_DELETE_MANY, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeDeleteMany(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_DELETE_MANY, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeQueryMany', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeQueryMany(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_QUERY_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeQueryMany(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_QUERY_MANY, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeQueryMany(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeQueryMany(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_QUERY_MANY, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeQueryMany(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_QUERY_MANY, Test)).toBe(MockHook);
    });
  });

  describe('@BeforeFindOne', () => {
    it('should store the hook', () => {
      const hookFn = jest.fn();
      @BeforeFindOne(hookFn)
      class Test {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_FIND_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the base class', () => {
      const hookFn = jest.fn();
      @BeforeFindOne(hookFn)
      class Base {}

      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_FIND_ONE, Test)!;
      expect(new Stored().run).toBe(hookFn);
    });

    it('should return a hook from the child class if there is a hook on both the base and child', () => {
      const baseHookFn = jest.fn();
      @BeforeFindOne(baseHookFn)
      class Base {}

      const childHookFn = jest.fn();
      @BeforeFindOne(childHookFn)
      class Test extends Base {}

      const Stored: Class<Hook<any>> = getHookForType(HookTypes.BEFORE_FIND_ONE, Test)!;
      expect(new Stored().run).toBe(childHookFn);
    });

    it('should return the hook class', () => {
      const MockHook = createDefaultHook(jest.fn());
      @BeforeFindOne(MockHook)
      class Test {}
      expect(getHookForType(HookTypes.BEFORE_FIND_ONE, Test)).toBe(MockHook);
    });
  });
});
