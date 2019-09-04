import { IValidator } from './validation';

const THIS_FIELD = 'This field';

const emailValue = (message?: string): IValidator => {
  return (val: string, label = THIS_FIELD) => {
    message = message || `${label} is not a valid email address.`;
    return val && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(val) && message;
  };
};

const isRequired = (message?: string): IValidator => {
  return (val: any, label = THIS_FIELD) => {
    message = message || `${label} is required.`;
    return (val === undefined || val === null || val === '') && message;
  };
};

const minValue = (min: number, message?: string): IValidator => {
  return (val: number, label = THIS_FIELD) => {
    const text = min === 0 ? 'cannot be negative' : `cannot be less than ${min}`;
    message = message || `${label} ${text}`;
    return val < min && message;
  };
};

const maxValue = (max: number, message?: string): IValidator => {
  return (val: number, label = THIS_FIELD) => {
    message = message || `${label} cannot be greater than ${max}`;
    return val > max && message;
  };
};

const oneOf = (list: any[], message?: string): IValidator => {
  return (val: any, label = THIS_FIELD) => {
    list = list || [];
    message = message || `${label} must be one of (${list.join(', ')})`;
    return !list.includes(val) && message;
  };
};

const arrayNotEmpty = (message?: string): IValidator => {
  return (val: string | any[], label = THIS_FIELD) => {
    message = message || `${label} must contain at least one entry`;
    return val && val.length < 1 && message;
  };
};

const skipIfUndefined = (actualValidator: IValidator): IValidator => {
  return (val: any, label = THIS_FIELD) => {
    return val !== undefined && actualValidator(val, label);
  };
};

const valueUnique = (list: any[], message?: string): IValidator => {
  return (val: any, label = THIS_FIELD) => {
    list = list || [];
    message = message || `${label} must be not be included in (${list.join(', ')})`;
    return list.includes(val) && message;
  };
};

/**
 * A collection of reusable Validator factories.
 *
 * ex: Validators.isRequired('You have to provide a value')
 * ex: Validators.minValue(0)
 * ex: Validators.maxValue(65534, 'You cant do that!')
 */
export const Validators = {
  arrayNotEmpty,
  emailValue,
  isRequired,
  maxValue,
  minValue,
  oneOf,
  skipIfUndefined,
  valueUnique,
};

// Typescript kludge:
// check that all keys of validators are factory functions that return an IValidator without typing validators explicitly
function _kludgeTypecheck(): { [key: string]: (...args: any[]) => IValidator } {
  return Validators;
}
_kludgeTypecheck();
