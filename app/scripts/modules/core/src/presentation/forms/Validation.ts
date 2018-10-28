export type ValidationFunction = (value: any) => string | Function | Promise<any>;

export class Validation {
  public static compose = (...validationFns: ValidationFunction[]): ValidationFunction => {
    return (value: any) => validationFns.reduce((error, validationFn) => error || validationFn(value), null);
  };

  public static isRequired: ValidationFunction = (val: any) => {
    return (val === undefined || val === null || val === '') && 'This field is required';
  };
}
