import { traverseObject } from './traverseObject';

describe('traverseObject', () => {
  let keysWalked: string[];
  let valsWalked: any[];

  function defaultCallback(key: string, val: any) {
    keysWalked.push(key);
    valsWalked.push(val);
  }

  beforeEach(() => {
    keysWalked = [];
    valsWalked = [];
  });

  it('walks simple properties of an object', () => {
    const object = { foo: 1, bar: 2 };
    traverseObject(object, defaultCallback);
    expect(keysWalked).toEqual(['foo', 'bar']);
    expect(valsWalked).toEqual([1, 2]);
  });

  it('walks nested properties of an object', () => {
    const object = { foo: 1, bar: { prop1: 1, prop2: 2, prop3: 3 } };
    traverseObject(object, defaultCallback);
    expect(keysWalked).toEqual(['foo', 'bar.prop1', 'bar.prop2', 'bar.prop3']);
    expect(valsWalked).toEqual([1, 1, 2, 3]);
  });

  it('walks array properties of an object', () => {
    const object = { foo: 1, bar: [1, 2, 3] };
    traverseObject(object, defaultCallback);
    expect(keysWalked).toEqual(['foo', 'bar[0]', 'bar[1]', 'bar[2]']);
    expect(valsWalked).toEqual([1, 1, 2, 3]);
  });

  it('walks nested objects inside array properties of an object', () => {
    const object = { foo: 1, bar: [{ name: 'abc' }, { name: 'def' }, { name: 'ghi' }] };
    traverseObject(object, defaultCallback);
    expect(keysWalked).toEqual(['foo', 'bar[0].name', 'bar[1].name', 'bar[2].name']);
    expect(valsWalked).toEqual([1, 'abc', 'def', 'ghi']);
  });
});
