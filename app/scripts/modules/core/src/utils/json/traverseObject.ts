import { forIn, isPlainObject } from 'lodash';

/**
 * Deeply walks an object tree and invokes `callback` for every simple property leaf node
 * (i.e., a property that is neither a nested object, nor an array)
 *
 * @param object the object to walk
 * @param callback the callback to invoke on each simple leaf nodes.
 *        This callback receives the `path` and `value`.
 *        The `path` is a string representing the path into the object, which is compatible with lodash _.get(key).
 *        The `value` is the value of the simple leaf node.
 */
export const traverseObject = (object: object, callback: ITraverseCallback) => {
  return _traverseObject(null, object, callback);
};

type ITraverseCallback = (path: string, obj: object) => void;
const _traverseObject = (contextPath: string, obj: object, callback: ITraverseCallback) => {
  if (isPlainObject(obj)) {
    forIn(obj, (val, key) => _traverseObject(`${contextPath ? contextPath + '.' : ''}${key}`, val, callback));
  } else if (Array.isArray(obj)) {
    obj.forEach((val, idx) => _traverseObject(`${contextPath}[${idx}]`, val, callback));
  } else {
    callback(contextPath, obj);
  }
};
