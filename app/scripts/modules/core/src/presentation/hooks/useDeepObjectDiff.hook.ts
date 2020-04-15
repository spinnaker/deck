import React from 'react';
import { isEqual } from 'lodash';

const { useRef } = React;

export function useDeepObjectDiff(obj: object): number {
  const ref = useRef(obj);
  const version = useRef(1);
  const deepEqual = obj === ref.current || isEqual(obj, ref.current);
  ref.current = obj;
  if (!deepEqual) {
    version.current++;
  }
  return version.current;
}
