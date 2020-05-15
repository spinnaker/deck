import { get, isBoolean, isNil, set, startCase } from 'lodash';
import { IValidator, IValidatorResult, Validators } from './validators';

/** A FormValidator factory callback used by arrayForEach */
export type ICreateValidatorCallback = (
  path: string,
  item: any,
  index: number,
  array: any[],
  arrayLabel: string,
) => FormValidator;

// Internal interfaces
interface IErrorTuple {
  path: string;
  error: string;
}

interface IChildFormValidator {
  type: 'FormValidator';
  validator: FormValidator;
}

interface IChildDeferredArrayValidator {
  type: 'DeferredArrayValidator';
  createValidatorCallback: ICreateValidatorCallback;
}

type IChildValidatorDescriptor = IChildFormValidator | IChildDeferredArrayValidator;

/** The form validator builder interface */
export interface IFormValidator {
  /**
   * Defines a new form field to validate
   *
   * @param path the path to the field
   * @param label (optional) the label of this field.
   * If no label is provided, it will be inferred based on the name.
   */
  field(path: string, label?: string): IFormValidator;

  /**
   * Makes this FormValidator default to being spel-aware or not
   *
   * When true, all fields in this FormValidator will default to allowing spel values to pass validation.
   * Individual fields may override this default by calling field().spelAware()
   */
  spelAware(isSpelAware?: boolean): IFormValidator;

  /** Causes the field to fail validation if the value is undefined, null, or empty string. */
  required(message?: string): IFormValidator;

  /**
   * Causes the field to pass validation if the value is undefined, null, or empty string.
   * Fields are default by default.
   */
  optional(): IFormValidator;

  /** Adds additional validators for the current path */
  withValidators(...validators: IValidator[]): IFormValidator;

  /**
   * Runs validation rules on each item of an array.
   *
   * @param createValidatorCallback a callback that returns a FormValidator for each element of the array
   *        The FormValidator may add additional rules (i.e., required().withValidators(...))
   *        The FormValidator may also add additional nested object fields (i.e., .field('nested').withValidators(...))
   */
  arrayForEach(createValidatorCallback: ICreateValidatorCallback): IFormValidator;

  /**
   * This runs the provided values through the validation rules in this IFormValidator
   *
   * It aggregate all the field validation errors into an object compatible with Formik Errors.
   * Each field error is stored in the resulting object using the field's 'name' as a path.
   *
   * @param values the object to validate
   */
  validate(values: any): any;
}

/**
 * Implementation of IFormValidator
 *
 * Currently, the public API is to create `new FormValidator()` objects.
 * In the future, we may migrate to a factory function to avoid exposing the implementation class.
 * The builder methods of this class return IFormValidator
 */
export class FormValidator implements IFormValidator {
  protected path: string;
  protected label: string;

  protected validators: IValidator[];
  protected isRequired: boolean;
  protected isRequiredMessage: string;
  protected isSpelAware: boolean;

  // Tracks the parent FormValidator to inherit settings (isSpelAware)
  protected parentValidator: FormValidator;
  // An array of all child FormValidators
  protected children: IChildValidatorDescriptor[];

  constructor(path?: string, label?: string) {
    this.path = path;
    this.label = label;
    this.validators = [];
    this.children = [];
  }

  /** Calling .field() registers a child FormValidator with the given path and label */
  public field(path: string, label?: string): FormValidator {
    label = label || startCase(path);
    const nestedPath = isNil(this.path) ? path : `${this.path}.${path}`;
    const fieldValidator = new FormValidator(nestedPath, label);
    this.children.push({ type: 'FormValidator', validator: fieldValidator });
    fieldValidator.parentValidator = this;
    return fieldValidator;
  }

  public spelAware(isSpelAware = true): IFormValidator {
    this.isSpelAware = isSpelAware;
    return this;
  }

  /** Spel awareness should be inherited from parent validators when not explicitly set in this object */
  private getIsSpelAware(): boolean {
    return isBoolean(this.isSpelAware)
      ? this.isSpelAware
      : this.parentValidator
      ? this.parentValidator.getIsSpelAware()
      : false;
  }

  public required(message?: string): IFormValidator {
    this.isRequired = true;
    this.isRequiredMessage = message;
    return this;
  }

  public optional(): IFormValidator {
    this.isRequired = false;
    this.isRequiredMessage = undefined;
    return this;
  }

  public withValidators(...validators: IValidator[]): IFormValidator {
    this.validators.push(...validators);
    return this;
  }

  /**
   * Configures the validator to run validation rules on each item of an array.
   *
   * @param createValidatorCallback a callback that returns a FormValidator for each element of the array
   *        The FormValidator may add additional rules (i.e., required().withValidators(...))
   *        The FormValidator may also add additional nested object fields (i.e., .field('nested').withValidators(...))
   */
  public arrayForEach(createValidatorCallback: ICreateValidatorCallback): IFormValidator {
    this.children.push({ type: 'DeferredArrayValidator', createValidatorCallback });
    return this;
  }

  /** Builds an array of IValidator rules.  Uses the object's flags to automatically add optional/required/spel */
  protected getValidators(validator: FormValidator): IValidator[] {
    const requiredValidator = validator.isRequired ? Validators.isRequired(validator.isRequiredMessage) : null;
    const optionalValidator = !validator.isRequired ? isOptionalValidator() : null;
    const spelValidator = this.getIsSpelAware() ? spelAwareValidator() : null;

    return [requiredValidator, optionalValidator, spelValidator, ...validator.validators].filter(x => !!x);
  }

  /**
   * Helper method that runs a single child validator.
   * If the child is DeferredArrayValidator type, it calls the FormValidator
   * factory function for each array element and validates the array element
   */
  protected runChildValidator(
    child: IChildValidatorDescriptor,
    errorsAccumulator: IErrorTuple[],
    values: any,
    value: any,
    path: string,
  ) {
    if (child.type === 'FormValidator') {
      child.validator.accumulateErrors(errorsAccumulator, values);
    } else if (child.type === 'DeferredArrayValidator') {
      const array = Array.isArray(value) ? value : [];
      array.forEach((item, idx) => {
        // Lazily creates a new child validator for each array element :(
        // Necessary because we allow the validator to be built conditionally based on the current element value
        const validator = child.createValidatorCallback(`${path}[${idx}]`, item, idx, array, this.label);
        validator.parentValidator = this;
        validator.accumulateErrors(errorsAccumulator, values);
      });
    }
  }

  /**
   * Pushes validation errors to the errorsAccumulator
   * First, pushes any error found for the FormValidator's path (selfError)
   * Then, tells each child FormValidator to accumulate its errors
   */
  protected accumulateErrors(errorsAccumulator: IErrorTuple[], values: any) {
    // Runs all validators until one returns a truthy value
    const value = this.path ? get(values, this.path) : values;
    const fieldValidators = this.getValidators(this);

    const selfError = fieldValidators.reduce(
      (result, validator) => (result ? result : validator(value, this.label)),
      '', // Start with a falsey ValidatorResult (other than undefined, which will trip out Array.reduce())
    );

    if (isError(selfError)) {
      errorsAccumulator.push({ path: this.path, error: selfError });
    }

    this.children.forEach(child => this.runChildValidator(child, errorsAccumulator, values, value, this.path));
  }

  /** Validates the values against this FormValidator */
  public validate(values: any): any {
    const errors = [] as IErrorTuple[];
    this.accumulateErrors(errors, values);
    return expandErrors(errors, Array.isArray(values));
  }
}

// Used by isOptionalValidator to short circuit and mark the field as valid without testing any further validators
export const FORM_VALIDATION_VALIDATABLE_FIELD_IS_VALID_SHORT_CIRCUIT = '__FIELD_IS_VALID_SHORT_CIRCUIT__';

/**
 * Not exported because it uses.short circuiting, so it only works inside of a FormValidator
 * Use via ValidatableField.optional().
 */
function isOptionalValidator(): IValidator {
  return function isOptionalValidator(value) {
    const isValueMissing = value === undefined || value === null || value === '';
    return isValueMissing ? FORM_VALIDATION_VALIDATABLE_FIELD_IS_VALID_SHORT_CIRCUIT : null;
  };
}

/**
 * Not exported because it uses.short circuiting, so it only works inside of a FormValidator
 * Use via ValidatableField.spelAware().
 */
function spelAwareValidator(): IValidator {
  return function spelAwareValidator(value) {
    const isSpelContent = typeof value === 'string' && value.includes('${');
    return isSpelContent ? FORM_VALIDATION_VALIDATABLE_FIELD_IS_VALID_SHORT_CIRCUIT : null;
  };
}

const isError = (maybeError: any): boolean => {
  if (!maybeError) {
    return false;
  } else if (maybeError === FORM_VALIDATION_VALIDATABLE_FIELD_IS_VALID_SHORT_CIRCUIT) {
    return false;
  } else if (typeof maybeError === 'string') {
    return true;
  } else if (Array.isArray(maybeError)) {
    return !!maybeError.length;
  } else if (typeof maybeError === 'object') {
    return !!Object.keys(maybeError).length;
  }
  return !!maybeError;
};

/** Transforms a list of tuples into a Formik-compatible errors object */
const expandErrors = (errors: IErrorTuple[], isArray: boolean) => {
  return errors.reduce((acc, curr) => set(acc, curr.path, curr.error), isArray ? [] : {});
};

/** Runs multiple IValidators against a single value.  Returns the first result */
export const composeValidators = (validators: IValidator[]): IValidator => {
  const validatorList = validators.filter(x => !!x);
  if (!validatorList.length) {
    return null;
  } else if (validatorList.length === 1) {
    return validatorList[0];
  }

  const composedValidators: IValidator = (value: any, label?: string) => {
    const results: IValidatorResult[] = validatorList.map(validator => validator(value, label));
    // Return the first error returned from a validator
    return results.find(error => !!error);
  };

  return composedValidators;
};
