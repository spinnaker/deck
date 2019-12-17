import classNames from 'classnames';
import { isString } from 'lodash';

import { noop } from 'core/utils';

import { IFormInputValidation } from './interface';

export const orEmptyString = (val: any) => val || '';

export const validationClassName = (validation = {} as IFormInputValidation) => {
  return classNames({
    'ng-dirty': !!validation.touched,
    'ng-invalid': validation.category === 'error',
    'ng-warning': validation.category === 'warning',
  });
};

export const createFakeReactSyntheticEvent = (target: { name?: string; value?: any }) =>
  ({
    persist: noop,
    stopPropagation: noop,
    preventDefault: noop,
    target,
  } as React.ChangeEvent<any>);

export const isStringArray = (opts: readonly any[]): opts is string[] => opts && opts.length && opts.every(isString);
